import { env } from "../../config/env.js";
import { META_GRAPH_VERSION } from "../../platforms/platform.config.js";
import { META_ADS_SCOPES } from "./meta-ads.types.js";
import {
  conversionsFromActions,
  spendToMicros,
  toMetaDateString,
} from "./meta-ads.queries.js";

const GRAPH = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

function appId(): string {
  return env.META_APP_ID ?? "";
}

function appSecret(): string {
  return env.META_APP_SECRET ?? "";
}

function redirectUri(): string {
  return env.META_ADS_REDIRECT_URI ?? "";
}

export function isMetaAdsConfigured(): boolean {
  return Boolean(appId() && appSecret() && redirectUri());
}

export function getMetaAdsAuthUrl(state: string): string {
  if (env.META_CONFIG_ID && !env.META_ADS_CONFIG_ID) {
    throw new Error(
      "META_ADS_CONFIG_ID is required when META_CONFIG_ID is set. Create a Login for Business configuration with ads_read + business_management in Meta Developer Portal.",
    );
  }

  const params = new URLSearchParams({
    client_id: appId(),
    redirect_uri: redirectUri(),
    state,
    response_type: "code",
  });

  if (env.META_ADS_CONFIG_ID) {
    params.set("config_id", env.META_ADS_CONFIG_ID);
  } else {
    params.set("scope", META_ADS_SCOPES.join(","));
  }

  return `https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
}

export type MetaTokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
};

export async function exchangeMetaAdsAuthCode(code: string): Promise<MetaTokenResponse> {
  const url = new URL(`${GRAPH}/oauth/access_token`);
  url.searchParams.set("client_id", appId());
  url.searchParams.set("client_secret", appSecret());
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("code", code);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Meta Ads token exchange failed (${response.status}): ${await response.text()}`);
  }

  const shortLived = (await response.json()) as MetaTokenResponse;
  return exchangeForLongLivedToken(shortLived.access_token);
}

export async function exchangeForLongLivedToken(
  shortLivedToken: string,
): Promise<MetaTokenResponse> {
  const url = new URL(`${GRAPH}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", appId());
  url.searchParams.set("client_secret", appSecret());
  url.searchParams.set("fb_exchange_token", shortLivedToken);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Meta long-lived token exchange failed (${response.status}): ${await response.text()}`);
  }

  return response.json() as Promise<MetaTokenResponse>;
}

export type MetaAdAccount = {
  id: string;
  name?: string;
  accountId: string;
};

type AdAccountRow = {
  id?: string;
  name?: string;
  account_id?: string;
  account_status?: number;
};

type AdAccountsResponse = {
  data?: AdAccountRow[];
  paging?: { next?: string };
};

type BusinessesResponse = {
  data?: Array<{
    id?: string;
    name?: string;
    owned_ad_accounts?: { data?: AdAccountRow[] };
    client_ad_accounts?: { data?: AdAccountRow[] };
    ad_accounts?: { data?: AdAccountRow[] };
  }>;
  paging?: { next?: string };
};

type MeAdAccountsResponse = {
  adaccounts?: { data?: AdAccountRow[] };
};

type DebugTokenResponse = {
  data?: {
    is_valid?: boolean;
    scopes?: string[];
    granular_scopes?: Array<{ scope?: string }>;
    error?: { message?: string };
  };
};

function normalizeAdAccountId(row: AdAccountRow): string | null {
  if (row.account_id) return row.account_id.replace(/^act_/, "");
  if (row.id) return row.id.replace(/^act_/, "");
  return null;
}

function mapAdAccountRows(rows: AdAccountRow[]): MetaAdAccount[] {
  const accounts: MetaAdAccount[] = [];

  for (const row of rows) {
    const accountId = normalizeAdAccountId(row);
    if (!accountId) continue;
    accounts.push({
      id: accountId,
      accountId,
      name: row.name,
    });
  }

  return accounts;
}

async function fetchGraphJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Meta Graph API failed (${response.status}): ${await response.text()}`);
  }
  return response.json() as Promise<T>;
}

async function fetchAllPages(initialUrl: string): Promise<AdAccountRow[]> {
  const rows: AdAccountRow[] = [];
  let nextUrl: string | undefined = initialUrl;

  while (nextUrl) {
    const page: AdAccountsResponse = await fetchGraphJson<AdAccountsResponse>(nextUrl);
    rows.push(...(page.data ?? []));
    nextUrl = page.paging?.next;
  }

  return rows;
}

async function listUserAdAccounts(accessToken: string): Promise<MetaAdAccount[]> {
  const directUrl = new URL(`${GRAPH}/me/adaccounts`);
  directUrl.searchParams.set("fields", "id,name,account_id,account_status,currency");
  directUrl.searchParams.set("limit", "100");
  directUrl.searchParams.set("access_token", accessToken);

  const meUrl = new URL(`${GRAPH}/me`);
  meUrl.searchParams.set("fields", "adaccounts{id,name,account_id,account_status,currency}");
  meUrl.searchParams.set("access_token", accessToken);

  const [directRows, mePayload] = await Promise.all([
    fetchAllPages(directUrl.toString()).catch(() => [] as AdAccountRow[]),
    fetchGraphJson<MeAdAccountsResponse>(meUrl.toString()).catch(() => ({ adaccounts: { data: [] } })),
  ]);

  return mapAdAccountRows([...directRows, ...(mePayload.adaccounts?.data ?? [])]);
}

async function listBusinessAdAccounts(accessToken: string): Promise<MetaAdAccount[]> {
  const nestedUrl = new URL(`${GRAPH}/me/businesses`);
  nestedUrl.searchParams.set(
    "fields",
    "id,name,owned_ad_accounts{id,name,account_id,account_status,currency},client_ad_accounts{id,name,account_id,account_status,currency}",
  );
  nestedUrl.searchParams.set("limit", "50");
  nestedUrl.searchParams.set("access_token", accessToken);

  const rows: AdAccountRow[] = [];
  let nextUrl: string | undefined = nestedUrl.toString();

  while (nextUrl) {
    const page: BusinessesResponse = await fetchGraphJson<BusinessesResponse>(nextUrl);
    for (const business of page.data ?? []) {
      rows.push(
        ...(business.owned_ad_accounts?.data ?? []),
        ...(business.client_ad_accounts?.data ?? []),
        ...(business.ad_accounts?.data ?? []),
      );

      if (!business.id) continue;

      for (const edge of ["owned_ad_accounts", "client_ad_accounts", "ad_accounts"] as const) {
        const accountUrl = new URL(`${GRAPH}/${business.id}/${edge}`);
        accountUrl.searchParams.set("fields", "id,name,account_id,account_status,currency");
        accountUrl.searchParams.set("limit", "100");
        accountUrl.searchParams.set("access_token", accessToken);

        try {
          const pageRows = await fetchAllPages(accountUrl.toString());
          rows.push(...pageRows);
        } catch {
          // Edge may be unavailable for this business/user combination.
        }
      }
    }
    nextUrl = page.paging?.next;
  }

  return mapAdAccountRows(rows);
}

export function normalizeMetaAdAccountId(raw: string): string {
  return raw.trim().replace(/^act_/i, "");
}

export async function getAdAccountDetails(
  accessToken: string,
  rawAdAccountId: string,
): Promise<MetaAdAccount> {
  const adAccountId = normalizeMetaAdAccountId(rawAdAccountId);
  if (!/^\d+$/.test(adAccountId)) {
    throw new Error("Ad account ID must be numeric (example: 123456789 or act_123456789).");
  }

  const url = new URL(`${GRAPH}/act_${adAccountId}`);
  url.searchParams.set("fields", "id,name,account_id,account_status");
  url.searchParams.set("access_token", accessToken);

  const row = await fetchGraphJson<AdAccountRow>(url.toString());
  const resolvedId = normalizeAdAccountId(row);
  if (!resolvedId) {
    throw new Error("Meta did not return a valid ad account for that ID.");
  }

  return {
    id: resolvedId,
    accountId: resolvedId,
    name: row.name,
  };
}

export async function inspectMetaAdsToken(accessToken: string): Promise<{
  isValid: boolean;
  scopes: string[];
}> {
  const appToken = `${appId()}|${appSecret()}`;
  const url = new URL(`${GRAPH}/debug_token`);
  url.searchParams.set("input_token", accessToken);
  url.searchParams.set("access_token", appToken);

  const response = await fetch(url.toString());
  if (!response.ok) {
    return { isValid: false, scopes: [] };
  }

  const payload = (await response.json()) as DebugTokenResponse;
  const scopes = [
    ...(payload.data?.scopes ?? []),
    ...(payload.data?.granular_scopes?.map((entry) => entry.scope).filter(Boolean) as string[]),
  ];

  return {
    isValid: payload.data?.is_valid ?? false,
    scopes: [...new Set(scopes)],
  };
}

function dedupeAdAccounts(accounts: MetaAdAccount[]): MetaAdAccount[] {
  const seen = new Set<string>();
  const unique: MetaAdAccount[] = [];

  for (const account of accounts) {
    if (seen.has(account.accountId)) continue;
    seen.add(account.accountId);
    unique.push(account);
  }

  return unique;
}

export async function listAdAccounts(accessToken: string): Promise<MetaAdAccount[]> {
  const [userAccounts, businessAccounts] = await Promise.all([
    listUserAdAccounts(accessToken).catch(() => [] as MetaAdAccount[]),
    listBusinessAdAccounts(accessToken).catch(() => [] as MetaAdAccount[]),
  ]);

  return dedupeAdAccounts([...userAccounts, ...businessAccounts]);
}

export async function describeMetaAdsAccess(accessToken: string): Promise<string> {
  const tokenInfo = await inspectMetaAdsToken(accessToken);
  const scopes = tokenInfo.scopes.length > 0 ? tokenInfo.scopes.join(", ") : "unknown";

  if (!tokenInfo.scopes.includes("ads_read")) {
    return `Token is missing ads_read (granted: ${scopes}). Create a Login for Business configuration with ads_read + business_management, set META_ADS_CONFIG_ID in .env, and reconnect.`;
  }

  return `Token scopes look valid (${scopes}), but no ad accounts were returned. In Business Manager, confirm you have an ad account and that app ${appId()} is added under Business settings → Apps with ad account access.`;
}

export type MetaAnalyticsRow = {
  date: string;
  campaignId?: string;
  campaignName?: string;
  impressions: number;
  clicks: number;
  costMicros: bigint;
  conversions: number;
};

type InsightRow = {
  date_start?: string;
  campaign_id?: string;
  campaign_name?: string;
  impressions?: string;
  clicks?: string;
  spend?: string;
  actions?: Array<{ action_type?: string; value?: string }>;
};

type InsightsResponse = {
  data?: InsightRow[];
  paging?: { next?: string };
};

async function fetchInsightsPage(url: string): Promise<InsightsResponse> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Meta insights failed (${response.status}): ${await response.text()}`);
  }
  return response.json() as Promise<InsightsResponse>;
}

async function fetchAllInsights(
  accessToken: string,
  adAccountId: string,
  from: Date,
  to: Date,
  level: "account" | "campaign",
): Promise<MetaAnalyticsRow[]> {
  const timeRange = JSON.stringify({
    since: toMetaDateString(from),
    until: toMetaDateString(to),
  });

  const fields =
    level === "campaign"
      ? "campaign_id,campaign_name,impressions,clicks,spend,actions,date_start"
      : "impressions,clicks,spend,actions,date_start";

  const url = new URL(`${GRAPH}/act_${adAccountId}/insights`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("time_increment", "1");
  url.searchParams.set("time_range", timeRange);
  url.searchParams.set("level", level);
  url.searchParams.set("limit", "500");
  url.searchParams.set("access_token", accessToken);

  const rows: MetaAnalyticsRow[] = [];
  let nextUrl: string | undefined = url.toString();

  while (nextUrl) {
    const page = await fetchInsightsPage(nextUrl);
    for (const el of page.data ?? []) {
      const date = el.date_start;
      if (!date) continue;

      rows.push({
        date,
        campaignId: level === "campaign" ? el.campaign_id : undefined,
        campaignName: level === "campaign" ? el.campaign_name : undefined,
        impressions: Number.parseInt(el.impressions ?? "0", 10) || 0,
        clicks: Number.parseInt(el.clicks ?? "0", 10) || 0,
        costMicros: spendToMicros(el.spend),
        conversions: conversionsFromActions(el.actions),
      });
    }
    nextUrl = page.paging?.next;
  }

  return rows;
}

export async function fetchAccountDailyMetrics(
  accessToken: string,
  adAccountId: string,
  from: Date,
  to: Date,
): Promise<MetaAnalyticsRow[]> {
  return fetchAllInsights(accessToken, adAccountId, from, to, "account");
}

export async function fetchCampaignDailyMetrics(
  accessToken: string,
  adAccountId: string,
  from: Date,
  to: Date,
): Promise<MetaAnalyticsRow[]> {
  return fetchAllInsights(accessToken, adAccountId, from, to, "campaign");
}

export { redirectUri as getMetaAdsRedirectUri };
