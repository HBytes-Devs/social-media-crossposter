import type { LinkedInAdsAccount } from "@prisma/client";
import { prisma } from "../config/database.js";
import { AppError } from "../middleware/error.middleware.js";
import {
  exchangeLinkedInAdsAuthCode,
  fetchAccountDailyMetrics,
  fetchCampaignDailyMetrics,
  getLinkedInAdsAuthUrl,
  getLinkedInAdsRedirectUri,
  isLinkedInAdsConfigured,
  listAdAccounts,
  listCampaigns,
  refreshLinkedInAdsAccessToken,
} from "../integrations/linkedin-ads/linkedin-ads.client.js";
import {
  buildTotals,
  resolveDateRange,
} from "../integrations/linkedin-ads/linkedin-ads.queries.js";
import type {
  LinkedInAdsAccountPublic,
  LinkedInAdsAnalyticsSummary,
  LinkedInAdsCampaignSummary,
  LinkedInAdsDailyMetric,
  LinkedInAdsDatePreset,
  LinkedInAdsStatus,
} from "../integrations/linkedin-ads/linkedin-ads.types.js";
import { LINKEDIN_ADS_DATE_PRESETS } from "../integrations/linkedin-ads/linkedin-ads.types.js";
import { decrypt, encrypt, generateStateToken, verifyStateToken } from "./encryption.service.js";

function toPublicAccount(account: LinkedInAdsAccount): LinkedInAdsAccountPublic {
  return {
    id: account.id,
    adAccountId: account.adAccountId,
    adAccountName: account.adAccountName,
    isActive: account.isActive,
    lastSyncedAt: account.lastSyncedAt?.toISOString() ?? null,
    createdAt: account.createdAt.toISOString(),
  };
}

function parseDatePreset(value?: string): LinkedInAdsDatePreset {
  const upper = (value ?? "LAST_30_DAYS").toUpperCase();
  if (!LINKEDIN_ADS_DATE_PRESETS.includes(upper as LinkedInAdsDatePreset)) {
    throw new AppError(400, `Invalid date preset. Use: ${LINKEDIN_ADS_DATE_PRESETS.join(", ")}`);
  }
  return upper as LinkedInAdsDatePreset;
}

async function getActiveAccount(userId: string) {
  return prisma.linkedInAdsAccount.findFirst({
    where: { userId, isActive: true },
    orderBy: { updatedAt: "desc" },
  });
}

async function ensureValidAccessToken(account: LinkedInAdsAccount): Promise<string> {
  const accessToken = decrypt(account.accessToken);

  if (!account.expiresAt || account.expiresAt.getTime() > Date.now() + 60_000) {
    return accessToken;
  }

  if (!account.refreshToken) {
    throw new AppError(401, "LinkedIn Ads token expired. Reconnect your account.");
  }

  const refreshed = await refreshLinkedInAdsAccessToken(decrypt(account.refreshToken));
  const expiresAt = refreshed.expires_in
    ? new Date(Date.now() + refreshed.expires_in * 1000)
    : null;

  await prisma.linkedInAdsAccount.update({
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

export function getLinkedInAdsStatus(): LinkedInAdsStatus {
  const configured = isLinkedInAdsConfigured();

  return {
    configured,
    connected: false,
    redirectUri: getLinkedInAdsRedirectUri() || null,
    connectHint: configured
      ? "GET /api/v1/linkedin-ads/connect-url (authenticated)"
      : "Add LINKEDIN_ADS_REDIRECT_URI (+ LINKEDIN_ADS_CLIENT_ID/SECRET or reuse LINKEDIN_CLIENT_*) to .env",
  };
}

export async function getLinkedInAdsStatusForUser(userId: string): Promise<LinkedInAdsStatus> {
  const base = getLinkedInAdsStatus();
  const account = await getActiveAccount(userId);
  return { ...base, connected: Boolean(account) };
}

export function getConnectUrl(userId: string): string {
  if (!isLinkedInAdsConfigured()) {
    throw new AppError(
      503,
      "LinkedIn Ads is not configured. Add LINKEDIN_ADS_REDIRECT_URI and LinkedIn client credentials to .env",
    );
  }

  return getLinkedInAdsAuthUrl(generateStateToken(userId));
}

export async function handleOAuthCallback(
  code: string,
  state: string,
): Promise<LinkedInAdsAccountPublic> {
  if (!isLinkedInAdsConfigured()) {
    throw new AppError(503, "LinkedIn Ads is not configured");
  }

  const { userId } = verifyStateToken(state);
  const tokenResult = await exchangeLinkedInAdsAuthCode(code);
  const accessToken = tokenResult.access_token;
  const expiresAt = tokenResult.expires_in
    ? new Date(Date.now() + tokenResult.expires_in * 1000)
    : null;

  const adAccounts = await listAdAccounts(accessToken);
  if (adAccounts.length === 0) {
    throw new AppError(
      400,
      "No LinkedIn Ads accounts found. Ensure your LinkedIn user can access an Ads account and the app has r_ads / r_ads_reporting.",
    );
  }

  const first = adAccounts[0]!;

  const account = await prisma.linkedInAdsAccount.upsert({
    where: {
      userId_adAccountId: { userId, adAccountId: first.id },
    },
    create: {
      userId,
      adAccountId: first.id,
      adAccountName: first.name ?? null,
      accessToken: encrypt(accessToken),
      refreshToken: tokenResult.refresh_token ? encrypt(tokenResult.refresh_token) : null,
      expiresAt,
      scopes: tokenResult.scope ? tokenResult.scope.split(" ") : ["r_ads", "r_ads_reporting"],
      isActive: true,
      metadata: { availableAccounts: adAccounts },
    },
    update: {
      adAccountName: first.name ?? null,
      accessToken: encrypt(accessToken),
      refreshToken: tokenResult.refresh_token
        ? encrypt(tokenResult.refresh_token)
        : undefined,
      expiresAt,
      scopes: tokenResult.scope ? tokenResult.scope.split(" ") : undefined,
      isActive: true,
      metadata: { availableAccounts: adAccounts },
    },
  });

  return toPublicAccount(account);
}

export async function listAccounts(userId: string): Promise<LinkedInAdsAccountPublic[]> {
  const accounts = await prisma.linkedInAdsAccount.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return accounts.map(toPublicAccount);
}

export async function disconnectAccount(userId: string, accountId: string): Promise<void> {
  const account = await prisma.linkedInAdsAccount.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) throw new AppError(404, "LinkedIn Ads account not found");
  await prisma.linkedInAdsAccount.delete({ where: { id: account.id } });
}

export async function syncMetrics(
  userId: string,
  options: {
    preset?: LinkedInAdsDatePreset;
    from?: string;
    to?: string;
    accountId?: string;
  } = {},
): Promise<LinkedInAdsAnalyticsSummary> {
  const account = options.accountId
    ? await prisma.linkedInAdsAccount.findFirst({
        where: { id: options.accountId, userId, isActive: true },
      })
    : await getActiveAccount(userId);

  if (!account) {
    return emptySummary(options.preset ?? "LAST_30_DAYS", options.from, options.to);
  }

  const preset = options.preset ?? "LAST_30_DAYS";
  const range = resolveDateRange(preset, options.from, options.to);
  const accessToken = await ensureValidAccessToken(account);

  const [accountRows, campaignRows, campaigns] = await Promise.all([
    fetchAccountDailyMetrics(accessToken, account.adAccountId, range.from, range.to),
    fetchCampaignDailyMetrics(accessToken, account.adAccountId, range.from, range.to),
    listCampaigns(accessToken, account.adAccountId).catch(() => []),
  ]);

  const campaignNames = new Map(campaigns.map((c) => [c.id, c.name]));

  for (const row of accountRows) {
    const impressions = row.impressions;
    const clicks = row.clicks;
    const costMicros = row.costMicros;
    const conversions = row.conversions;
    const ctr =
      impressions > 0 ? Math.round((clicks / impressions) * 10_000) / 100 : 0;

    await prisma.linkedInAdsAccountMetric.upsert({
      where: {
        linkedInAdsAccountId_date: {
          linkedInAdsAccountId: account.id,
          date: new Date(row.date),
        },
      },
      create: {
        linkedInAdsAccountId: account.id,
        date: new Date(row.date),
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
    if (!row.campaignId) continue;

    const impressions = row.impressions;
    const clicks = row.clicks;
    const costMicros = row.costMicros;
    const conversions = row.conversions;
    const ctr =
      impressions > 0 ? Math.round((clicks / impressions) * 10_000) / 100 : 0;
    const campaignName = campaignNames.get(row.campaignId) ?? row.campaignId;

    await prisma.linkedInAdsCampaignMetric.upsert({
      where: {
        linkedInAdsAccountId_campaignId_date: {
          linkedInAdsAccountId: account.id,
          campaignId: row.campaignId,
          date: new Date(row.date),
        },
      },
      create: {
        linkedInAdsAccountId: account.id,
        campaignId: row.campaignId,
        campaignName,
        date: new Date(row.date),
        impressions,
        clicks,
        costMicros,
        conversions,
        ctr,
      },
      update: {
        campaignName,
        impressions,
        clicks,
        costMicros,
        conversions,
        ctr,
      },
    });
  }

  await prisma.linkedInAdsAccount.update({
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
): Promise<LinkedInAdsAnalyticsSummary> {
  const preset = parseDatePreset(options.preset);
  const range = resolveDateRange(preset, options.from, options.to);

  const account = options.accountId
    ? await prisma.linkedInAdsAccount.findFirst({
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
    prisma.linkedInAdsAccountMetric.findMany({
      where: {
        linkedInAdsAccountId: account.id,
        date: { gte: range.from, lte: range.to },
      },
      orderBy: { date: "asc" },
    }),
    prisma.linkedInAdsCampaignMetric.findMany({
      where: {
        linkedInAdsAccountId: account.id,
        date: { gte: range.from, lte: range.to },
      },
    }),
  ]);

  const daily: LinkedInAdsDailyMetric[] = accountMetrics.map((row) => ({
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

  const campaignMap = new Map<string, LinkedInAdsCampaignSummary>();

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
  preset: LinkedInAdsDatePreset,
  from?: string,
  to?: string,
): LinkedInAdsAnalyticsSummary {
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
