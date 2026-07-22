import type { MetaAdsAccount } from "@prisma/client";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { AppError } from "../middleware/error.middleware.js";
import {
  exchangeMetaAdsAuthCode,
  fetchAccountDailyMetrics,
  fetchCampaignDailyMetrics,
  getAdAccountDetails,
  getMetaAdsAuthUrl,
  getMetaAdsRedirectUri,
  isMetaAdsConfigured,
  listAdAccounts,
  describeMetaAdsAccess,
  inspectMetaAdsToken,
} from "../integrations/meta-ads/meta-ads.client.js";
import {
  buildTotals,
  resolveDateRange,
} from "../integrations/meta-ads/meta-ads.queries.js";
import type {
  MetaAdsAccountPublic,
  MetaAdsAnalyticsSummary,
  MetaAdsCampaignSummary,
  MetaAdsDailyMetric,
  MetaAdsDatePreset,
  MetaAdsStatus,
} from "../integrations/meta-ads/meta-ads.types.js";
import { META_ADS_DATE_PRESETS } from "../integrations/meta-ads/meta-ads.types.js";
import { META_ADS_PENDING_ACCOUNT_ID } from "../integrations/meta-ads/meta-ads.types.js";
import { decrypt, encrypt, generateStateToken, verifyStateToken } from "./encryption.service.js";

function toPublicAccount(account: MetaAdsAccount): MetaAdsAccountPublic {
  return {
    id: account.id,
    adAccountId: account.adAccountId,
    adAccountName: account.adAccountName,
    isActive: account.isActive,
    lastSyncedAt: account.lastSyncedAt?.toISOString() ?? null,
    createdAt: account.createdAt.toISOString(),
  };
}

function parseDatePreset(value?: string): MetaAdsDatePreset {
  const upper = (value ?? "LAST_30_DAYS").toUpperCase();
  if (!META_ADS_DATE_PRESETS.includes(upper as MetaAdsDatePreset)) {
    throw new AppError(400, `Invalid date preset. Use: ${META_ADS_DATE_PRESETS.join(", ")}`);
  }
  return upper as MetaAdsDatePreset;
}

async function getActiveAccount(userId: string) {
  return prisma.metaAdsAccount.findFirst({
    where: {
      userId,
      isActive: true,
      adAccountId: { not: META_ADS_PENDING_ACCOUNT_ID },
    },
    orderBy: { updatedAt: "desc" },
  });
}

async function getPendingAccount(userId: string) {
  return prisma.metaAdsAccount.findFirst({
    where: { userId, adAccountId: META_ADS_PENDING_ACCOUNT_ID, isActive: true },
  });
}

async function saveMetaAdsConnection(
  userId: string,
  accessToken: string,
  adAccount: { accountId: string; name?: string },
  expiresAt: Date | null,
  availableAccounts: Array<{ accountId: string; name?: string }>,
): Promise<MetaAdsAccount> {
  return prisma.metaAdsAccount.upsert({
    where: {
      userId_adAccountId: { userId, adAccountId: adAccount.accountId },
    },
    create: {
      userId,
      adAccountId: adAccount.accountId,
      adAccountName: adAccount.name ?? null,
      accessToken: encrypt(accessToken),
      refreshToken: null,
      expiresAt,
      scopes: ["ads_read", "business_management"],
      isActive: true,
      metadata: { availableAccounts },
    },
    update: {
      adAccountName: adAccount.name ?? null,
      accessToken: encrypt(accessToken),
      expiresAt,
      isActive: true,
      metadata: { availableAccounts },
    },
  });
}

async function ensureValidAccessToken(account: MetaAdsAccount): Promise<string> {
  const accessToken = decrypt(account.accessToken);

  if (!account.expiresAt || account.expiresAt.getTime() > Date.now() + 60_000) {
    return accessToken;
  }

  throw new AppError(
    401,
    "Meta Ads token expired. Reconnect your account (long-lived tokens last ~60 days).",
  );
}

export function getMetaAdsStatus(): MetaAdsStatus {
  const configured = isMetaAdsConfigured();
  const needsAdsConfig = Boolean(env.META_CONFIG_ID && !env.META_ADS_CONFIG_ID);

  return {
    configured: configured && !needsAdsConfig,
    connected: false,
    needsAdAccountId: false,
    redirectUri: getMetaAdsRedirectUri() || null,
    connectHint: needsAdsConfig
      ? "Set META_ADS_CONFIG_ID — create a Login for Business config with ads_read + business_management (separate from META_CONFIG_ID)"
      : configured
        ? "GET /api/v1/meta-ads/connect-url (authenticated)"
        : "Add META_APP_ID, META_APP_SECRET, and META_ADS_REDIRECT_URI to .env",
  };
}

export async function getMetaAdsStatusForUser(userId: string): Promise<MetaAdsStatus> {
  const base = getMetaAdsStatus();
  const [account, pending] = await Promise.all([getActiveAccount(userId), getPendingAccount(userId)]);
  return {
    ...base,
    connected: Boolean(account),
    needsAdAccountId: Boolean(pending),
  };
}

export type MetaAdsOAuthCallbackResult =
  | { status: "connected"; account: MetaAdsAccountPublic }
  | { status: "needs_ad_account" };

export function getConnectUrl(userId: string): string {
  if (!isMetaAdsConfigured()) {
    throw new AppError(
      503,
      "Meta Ads is not configured. Add META_ADS_REDIRECT_URI and Meta app credentials to .env",
    );
  }

  return getMetaAdsAuthUrl(generateStateToken(userId));
}

export async function handleOAuthCallback(
  code: string,
  state: string,
): Promise<MetaAdsOAuthCallbackResult> {
  if (!isMetaAdsConfigured()) {
    throw new AppError(503, "Meta Ads is not configured");
  }

  const { userId } = verifyStateToken(state);
  const tokenResult = await exchangeMetaAdsAuthCode(code);
  const accessToken = tokenResult.access_token;
  const expiresAt = tokenResult.expires_in
    ? new Date(Date.now() + tokenResult.expires_in * 1000)
    : null;

  const adAccounts = await listAdAccounts(accessToken);
  if (adAccounts.length === 0) {
    const tokenInfo = await inspectMetaAdsToken(accessToken);
    if (!tokenInfo.scopes.includes("ads_read")) {
      const hint = await describeMetaAdsAccess(accessToken);
      throw new AppError(400, `No Meta ad accounts found. ${hint}`);
    }

    await saveMetaAdsConnection(
      userId,
      accessToken,
      { accountId: META_ADS_PENDING_ACCOUNT_ID, name: "Pending ad account selection" },
      expiresAt,
      [],
    );

    return { status: "needs_ad_account" };
  }

  const first = adAccounts[0]!;
  const account = await saveMetaAdsConnection(userId, accessToken, first, expiresAt, adAccounts);

  await prisma.metaAdsAccount.deleteMany({
    where: { userId, adAccountId: META_ADS_PENDING_ACCOUNT_ID },
  });

  return { status: "connected", account: toPublicAccount(account) };
}

export async function linkAdAccount(
  userId: string,
  rawAdAccountId: string,
): Promise<MetaAdsAccountPublic> {
  const pending = await getPendingAccount(userId);
  const active = await getActiveAccount(userId);
  const source = pending ?? active;

  if (!source) {
    throw new AppError(400, "Connect Meta Ads first before linking an ad account ID.");
  }

  const accessToken = decrypt(source.accessToken);
  const details = await getAdAccountDetails(accessToken, rawAdAccountId).catch((err) => {
    const message = err instanceof Error ? err.message : "Unable to access that ad account";
    throw new AppError(
      400,
      `${message}. Confirm the ID from Ads Manager (act_123456789) and that your Facebook user has access.`,
    );
  });

  if (pending) {
    await prisma.metaAdsAccount.delete({ where: { id: pending.id } });
  }

  const account = await saveMetaAdsConnection(
    userId,
    accessToken,
    details,
    source.expiresAt,
    [details],
  );

  return toPublicAccount(account);
}

export async function listAccounts(userId: string): Promise<MetaAdsAccountPublic[]> {
  const accounts = await prisma.metaAdsAccount.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return accounts.map(toPublicAccount);
}

export async function disconnectAccount(userId: string, accountId: string): Promise<void> {
  const account = await prisma.metaAdsAccount.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) throw new AppError(404, "Meta Ads account not found");
  await prisma.metaAdsAccount.delete({ where: { id: account.id } });
}

export async function syncMetrics(
  userId: string,
  options: {
    preset?: MetaAdsDatePreset;
    from?: string;
    to?: string;
    accountId?: string;
  } = {},
): Promise<MetaAdsAnalyticsSummary> {
  const account = options.accountId
    ? await prisma.metaAdsAccount.findFirst({
        where: { id: options.accountId, userId, isActive: true },
      })
    : await getActiveAccount(userId);

  if (!account) {
    return emptySummary(options.preset ?? "LAST_30_DAYS", options.from, options.to);
  }

  const preset = options.preset ?? "LAST_30_DAYS";
  const range = resolveDateRange(preset, options.from, options.to);
  const accessToken = await ensureValidAccessToken(account);

  let accountRows;
  let campaignRows;
  try {
    [accountRows, campaignRows] = await Promise.all([
      fetchAccountDailyMetrics(accessToken, account.adAccountId, range.from, range.to),
      fetchCampaignDailyMetrics(accessToken, account.adAccountId, range.from, range.to),
    ]);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Meta Ads sync failed";
    const status =
      message.includes("permission") || message.includes("OAuthException") ? 403 : 502;
    throw new AppError(status, message);
  }

  for (const row of accountRows) {
    const impressions = row.impressions;
    const clicks = row.clicks;
    const costMicros = row.costMicros;
    const conversions = row.conversions;
    const ctr =
      impressions > 0 ? Math.round((clicks / impressions) * 10_000) / 100 : 0;

    await prisma.metaAdsAccountMetric.upsert({
      where: {
        metaAdsAccountId_date: {
          metaAdsAccountId: account.id,
          date: new Date(row.date),
        },
      },
      create: {
        metaAdsAccountId: account.id,
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
    const campaignName = row.campaignName ?? row.campaignId;

    await prisma.metaAdsCampaignMetric.upsert({
      where: {
        metaAdsAccountId_campaignId_date: {
          metaAdsAccountId: account.id,
          campaignId: row.campaignId,
          date: new Date(row.date),
        },
      },
      create: {
        metaAdsAccountId: account.id,
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

  await prisma.metaAdsAccount.update({
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
): Promise<MetaAdsAnalyticsSummary> {
  const preset = parseDatePreset(options.preset);
  const range = resolveDateRange(preset, options.from, options.to);

  const account = options.accountId
    ? await prisma.metaAdsAccount.findFirst({
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
    prisma.metaAdsAccountMetric.findMany({
      where: {
        metaAdsAccountId: account.id,
        date: { gte: range.from, lte: range.to },
      },
      orderBy: { date: "asc" },
    }),
    prisma.metaAdsCampaignMetric.findMany({
      where: {
        metaAdsAccountId: account.id,
        date: { gte: range.from, lte: range.to },
      },
    }),
  ]);

  const daily: MetaAdsDailyMetric[] = accountMetrics.map((row) => ({
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

  const campaignMap = new Map<string, MetaAdsCampaignSummary>();

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
  preset: MetaAdsDatePreset,
  from?: string,
  to?: string,
): MetaAdsAnalyticsSummary {
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
