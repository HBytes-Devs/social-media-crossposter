import type { GoogleAdsAccount } from "@prisma/client";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { AppError } from "../middleware/error.middleware.js";
import {
  exchangeGoogleAuthCode,
  fetchCustomerName,
  getGoogleAdsAuthUrl,
  isGoogleAdsConfigured,
  listAccessibleCustomers,
  refreshGoogleAccessToken,
  searchGoogleAds,
} from "../integrations/google-ads/google-ads.client.js";
import {
  buildAccountMetricsQuery,
  buildCampaignMetricsQuery,
  buildTotals,
  formatGaqlDate,
  resolveDateRange,
} from "../integrations/google-ads/google-ads.queries.js";
import type {
  GoogleAdsAccountPublic,
  GoogleAdsAnalyticsSummary,
  GoogleAdsCampaignSummary,
  GoogleAdsDailyMetric,
  GoogleAdsDatePreset,
  GoogleAdsStatus,
} from "../integrations/google-ads/google-ads.types.js";
import { GOOGLE_ADS_DATE_PRESETS } from "../integrations/google-ads/google-ads.types.js";
import { encrypt, decrypt, generateStateToken, verifyStateToken } from "./encryption.service.js";

function toPublicAccount(account: GoogleAdsAccount): GoogleAdsAccountPublic {
  return {
    id: account.id,
    customerId: account.customerId,
    customerName: account.customerName,
    loginCustomerId: account.loginCustomerId,
    isActive: account.isActive,
    lastSyncedAt: account.lastSyncedAt?.toISOString() ?? null,
    createdAt: account.createdAt.toISOString(),
  };
}

function parseDatePreset(value?: string): GoogleAdsDatePreset {
  const upper = (value ?? "LAST_30_DAYS").toUpperCase();
  if (!GOOGLE_ADS_DATE_PRESETS.includes(upper as GoogleAdsDatePreset)) {
    throw new AppError(400, `Invalid date preset. Use: ${GOOGLE_ADS_DATE_PRESETS.join(", ")}`);
  }
  return upper as GoogleAdsDatePreset;
}

async function getActiveAccount(userId: string) {
  return prisma.googleAdsAccount.findFirst({
    where: { userId, isActive: true },
    orderBy: { updatedAt: "desc" },
  });
}

async function ensureValidAccessToken(account: GoogleAdsAccount): Promise<string> {
  const accessToken = decrypt(account.accessToken);

  if (!account.expiresAt || account.expiresAt.getTime() > Date.now() + 60_000) {
    return accessToken;
  }

  if (!account.refreshToken) {
    throw new AppError(401, "Google Ads token expired. Reconnect your account.");
  }

  const refreshed = await refreshGoogleAccessToken(decrypt(account.refreshToken));
  const expiresAt = refreshed.expires_in
    ? new Date(Date.now() + refreshed.expires_in * 1000)
    : null;

  await prisma.googleAdsAccount.update({
    where: { id: account.id },
    data: {
      accessToken: encrypt(refreshed.access_token),
      refreshToken: refreshed.refresh_token
        ? encrypt(refreshed.refresh_token)
        : account.refreshToken,
      expiresAt,
      scopes: refreshed.scope ? refreshed.scope.split(" ") : account.scopes,
    },
  });

  return refreshed.access_token;
}

export function getGoogleAdsStatus(): GoogleAdsStatus {
  const configured = isGoogleAdsConfigured();

  return {
    configured,
    connected: false,
    developerTokenSet: Boolean(env.GOOGLE_ADS_DEVELOPER_TOKEN),
    redirectUri: env.GOOGLE_ADS_REDIRECT_URI ?? null,
    connectHint: configured
      ? "GET /api/v1/google-ads/connect-url (authenticated)"
      : "Add GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_REDIRECT_URI to .env",
  };
}

export async function getGoogleAdsStatusForUser(userId: string): Promise<GoogleAdsStatus> {
  const base = getGoogleAdsStatus();
  const account = await getActiveAccount(userId);

  return {
    ...base,
    connected: Boolean(account),
  };
}

export function getConnectUrl(userId: string): string {
  if (!isGoogleAdsConfigured()) {
    throw new AppError(
      503,
      "Google Ads is not configured. Add GOOGLE_ADS_* variables to .env",
    );
  }

  const state = generateStateToken(userId);
  return getGoogleAdsAuthUrl(state);
}

export async function handleOAuthCallback(
  code: string,
  state: string,
): Promise<GoogleAdsAccountPublic> {
  if (!isGoogleAdsConfigured()) {
    throw new AppError(503, "Google Ads is not configured");
  }

  const { userId } = verifyStateToken(state);
  const tokenResult = await exchangeGoogleAuthCode(code);
  const accessToken = tokenResult.access_token;
  const expiresAt = tokenResult.expires_in
    ? new Date(Date.now() + tokenResult.expires_in * 1000)
    : null;

  const customerIds = await listAccessibleCustomers(accessToken);
  if (customerIds.length === 0) {
    throw new AppError(400, "No accessible Google Ads accounts found for this Google user");
  }

  const customerId = customerIds[0]!;
  const customerName = await fetchCustomerName(accessToken, customerId).catch(() => null);

  const account = await prisma.googleAdsAccount.upsert({
    where: {
      userId_customerId: { userId, customerId },
    },
    create: {
      userId,
      customerId,
      customerName,
      accessToken: encrypt(accessToken),
      refreshToken: tokenResult.refresh_token ? encrypt(tokenResult.refresh_token) : null,
      expiresAt,
      scopes: tokenResult.scope ? tokenResult.scope.split(" ") : ["https://www.googleapis.com/auth/adwords"],
      isActive: true,
    },
    update: {
      customerName,
      accessToken: encrypt(accessToken),
      refreshToken: tokenResult.refresh_token
        ? encrypt(tokenResult.refresh_token)
        : undefined,
      expiresAt,
      scopes: tokenResult.scope ? tokenResult.scope.split(" ") : undefined,
      isActive: true,
    },
  });

  return toPublicAccount(account);
}

export async function listAccounts(userId: string): Promise<GoogleAdsAccountPublic[]> {
  const accounts = await prisma.googleAdsAccount.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return accounts.map(toPublicAccount);
}

export async function disconnectAccount(userId: string, accountId: string): Promise<void> {
  const account = await prisma.googleAdsAccount.findFirst({
    where: { id: accountId, userId },
  });

  if (!account) {
    throw new AppError(404, "Google Ads account not found");
  }

  await prisma.googleAdsAccount.delete({ where: { id: account.id } });
}

export async function syncMetrics(
  userId: string,
  options: {
    preset?: GoogleAdsDatePreset;
    from?: string;
    to?: string;
    accountId?: string;
  } = {},
): Promise<GoogleAdsAnalyticsSummary> {
  const account = options.accountId
    ? await prisma.googleAdsAccount.findFirst({
        where: { id: options.accountId, userId, isActive: true },
      })
    : await getActiveAccount(userId);

  if (!account) {
    return emptySummary(options.preset ?? "LAST_30_DAYS", options.from, options.to);
  }

  const preset = options.preset ?? "LAST_30_DAYS";
  const range = resolveDateRange(preset, options.from, options.to);
  const from = formatGaqlDate(range.from);
  const to = formatGaqlDate(range.to);

  const accessToken = await ensureValidAccessToken(account);

  let accountRows;
  let campaignRows;
  try {
    [accountRows, campaignRows] = await Promise.all([
      searchGoogleAds(
        accessToken,
        account.customerId,
        buildAccountMetricsQuery(from, to),
        account.loginCustomerId,
      ),
      searchGoogleAds(
        accessToken,
        account.customerId,
        buildCampaignMetricsQuery(from, to),
        account.loginCustomerId,
      ),
    ]);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Google Ads sync failed";
    const status =
      message.includes("Test Access") || message.includes("PERMISSION_DENIED") || message.includes("permission")
        ? 403
        : 502;
    throw new AppError(status, message);
  }

  for (const row of accountRows) {
    const date = row.segments?.date;
    if (!date) continue;

    const impressions = Number(row.metrics?.impressions ?? 0);
    const clicks = Number(row.metrics?.clicks ?? 0);
    const costMicros = BigInt(row.metrics?.costMicros ?? 0);
    const conversions = Number(row.metrics?.conversions ?? 0);
    const ctr = Number(row.metrics?.ctr ?? 0) * 100;

    await prisma.googleAdsAccountMetric.upsert({
      where: {
        googleAdsAccountId_date: {
          googleAdsAccountId: account.id,
          date: new Date(date),
        },
      },
      create: {
        googleAdsAccountId: account.id,
        date: new Date(date),
        impressions,
        clicks,
        costMicros,
        conversions,
        ctr,
      },
      update: { impressions, clicks, costMicros, conversions, ctr },
    });
  }

  for (const row of campaignRows) {
    const date = row.segments?.date;
    const campaignId = row.campaign?.id;
    if (!date || !campaignId) continue;

    const impressions = Number(row.metrics?.impressions ?? 0);
    const clicks = Number(row.metrics?.clicks ?? 0);
    const costMicros = BigInt(row.metrics?.costMicros ?? 0);
    const conversions = Number(row.metrics?.conversions ?? 0);
    const ctr = Number(row.metrics?.ctr ?? 0) * 100;

    await prisma.googleAdsCampaignMetric.upsert({
      where: {
        googleAdsAccountId_campaignId_date: {
          googleAdsAccountId: account.id,
          campaignId,
          date: new Date(date),
        },
      },
      create: {
        googleAdsAccountId: account.id,
        campaignId,
        campaignName: row.campaign?.name ?? null,
        date: new Date(date),
        impressions,
        clicks,
        costMicros,
        conversions,
        ctr,
      },
      update: {
        campaignName: row.campaign?.name ?? null,
        impressions,
        clicks,
        costMicros,
        conversions,
        ctr,
      },
    });
  }

  await prisma.googleAdsAccount.update({
    where: { id: account.id },
    data: { lastSyncedAt: new Date() },
  });

  return getAnalyticsSummary(userId, {
    preset,
    from: options.from,
    to: options.to,
    accountId: account.id,
  });
}

export async function getAnalyticsSummary(
  userId: string,
  options: {
    preset?: string;
    from?: string;
    to?: string;
    accountId?: string;
    sync?: boolean;
  } = {},
): Promise<GoogleAdsAnalyticsSummary> {
  const preset = parseDatePreset(options.preset);
  const range = resolveDateRange(preset, options.from, options.to);

  const account = options.accountId
    ? await prisma.googleAdsAccount.findFirst({
        where: { id: options.accountId, userId, isActive: true },
      })
    : await getActiveAccount(userId);

  if (!account) {
    return emptySummary(preset, options.from, options.to);
  }

  if (options.sync) {
    return syncMetrics(userId, {
      preset,
      from: options.from,
      to: options.to,
      accountId: account.id,
    });
  }

  const [accountMetrics, campaignMetrics] = await Promise.all([
    prisma.googleAdsAccountMetric.findMany({
      where: {
        googleAdsAccountId: account.id,
        date: { gte: range.from, lte: range.to },
      },
      orderBy: { date: "asc" },
    }),
    prisma.googleAdsCampaignMetric.findMany({
      where: {
        googleAdsAccountId: account.id,
        date: { gte: range.from, lte: range.to },
      },
    }),
  ]);

  const daily: GoogleAdsDailyMetric[] = accountMetrics.map((row) => ({
    date: row.date.toISOString().slice(0, 10),
    ...buildTotals({
      impressions: row.impressions,
      clicks: row.clicks,
      costMicros: row.costMicros,
      conversions: row.conversions,
    }),
  }));

  const totals = buildTotals({
    impressions: accountMetrics.reduce((sum, row) => sum + row.impressions, 0),
    clicks: accountMetrics.reduce((sum, row) => sum + row.clicks, 0),
    costMicros: accountMetrics.reduce((sum, row) => sum + row.costMicros, 0n),
    conversions: accountMetrics.reduce((sum, row) => sum + row.conversions, 0),
  });

  const campaignMap = new Map<string, GoogleAdsCampaignSummary>();

  for (const row of campaignMetrics) {
    const existing = campaignMap.get(row.campaignId) ?? {
      campaignId: row.campaignId,
      campaignName: row.campaignName ?? row.campaignId,
      impressions: 0,
      clicks: 0,
      costMicros: "0",
      cost: 0,
      conversions: 0,
      ctr: 0,
    };

    existing.impressions += row.impressions;
    existing.clicks += row.clicks;
    existing.conversions += row.conversions;
    existing.costMicros = String(BigInt(existing.costMicros) + row.costMicros);
    existing.cost = buildTotals({
      impressions: existing.impressions,
      clicks: existing.clicks,
      costMicros: BigInt(existing.costMicros),
      conversions: existing.conversions,
    }).cost;

    campaignMap.set(row.campaignId, existing);
  }

  const topCampaigns = [...campaignMap.values()]
    .map((campaign) => ({
      ...campaign,
      ctr:
        campaign.impressions > 0
          ? Math.round((campaign.clicks / campaign.impressions) * 10_000) / 100
          : 0,
    }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10);

  return {
    account: toPublicAccount(account),
    datePreset: preset,
    from: range.from.toISOString().slice(0, 10),
    to: range.to.toISOString().slice(0, 10),
    totals,
    daily,
    topCampaigns,
    lastSyncedAt: account.lastSyncedAt?.toISOString() ?? null,
  };
}

function emptySummary(
  preset: GoogleAdsDatePreset,
  from?: string,
  to?: string,
): GoogleAdsAnalyticsSummary {
  const range = resolveDateRange(preset, from, to);
  const empty = buildTotals({ impressions: 0, clicks: 0, costMicros: 0, conversions: 0 });

  return {
    account: null,
    datePreset: preset,
    from: range.from.toISOString().slice(0, 10),
    to: range.to.toISOString().slice(0, 10),
    totals: empty,
    daily: [],
    topCampaigns: [],
    lastSyncedAt: null,
  };
}
