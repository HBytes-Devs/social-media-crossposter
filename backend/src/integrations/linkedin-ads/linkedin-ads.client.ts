import { env } from "../../config/env.js";
import { LINKEDIN_ADS_API_VERSION, LINKEDIN_ADS_SCOPES } from "./linkedin-ads.types.js";
import { currencyToMicros, toLinkedInDateRange } from "./linkedin-ads.queries.js";

const AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const API_BASE = "https://api.linkedin.com/rest";

function clientId(): string {
  return env.LINKEDIN_ADS_CLIENT_ID || env.LINKEDIN_CLIENT_ID || "";
}

function clientSecret(): string {
  return env.LINKEDIN_ADS_CLIENT_SECRET || env.LINKEDIN_CLIENT_SECRET || "";
}

function redirectUri(): string {
  return env.LINKEDIN_ADS_REDIRECT_URI || "";
}

export function isLinkedInAdsConfigured(): boolean {
  return Boolean(clientId() && clientSecret() && redirectUri());
}

export function getLinkedInAdsAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId(),
    redirect_uri: redirectUri(),
    state,
    scope: LINKEDIN_ADS_SCOPES.join(" "),
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export type LinkedInTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope?: string;
};

export async function exchangeLinkedInAdsAuthCode(code: string): Promise<LinkedInTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: clientId(),
    client_secret: clientSecret(),
    redirect_uri: redirectUri(),
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error(`LinkedIn Ads token exchange failed (${response.status}): ${await response.text()}`);
  }

  return response.json() as Promise<LinkedInTokenResponse>;
}

export async function refreshLinkedInAdsAccessToken(
  refreshToken: string,
): Promise<LinkedInTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId(),
    client_secret: clientSecret(),
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error(`LinkedIn Ads token refresh failed (${response.status}): ${await response.text()}`);
  }

  return response.json() as Promise<LinkedInTokenResponse>;
}

function adsHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    "LinkedIn-Version": env.LINKEDIN_API_VERSION || LINKEDIN_ADS_API_VERSION,
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json",
  };
}

export type LinkedInAdAccount = {
  id: string;
  name?: string;
  status?: string;
};

type AdAccountsResponse = {
  elements?: Array<{ id?: number | string; name?: string; status?: string }>;
};

export async function listAdAccounts(accessToken: string): Promise<LinkedInAdAccount[]> {
  const search =
    "(status:(values:List(ACTIVE,DRAFT,CANCELED,PENDING_DELETION,REMOVED)))";
  const url = `${API_BASE}/adAccounts?q=search&search=${encodeURIComponent(search)}&pageSize=50`;

  const response = await fetch(url, { headers: adsHeaders(accessToken) });
  if (!response.ok) {
    throw new Error(`LinkedIn list ad accounts failed (${response.status}): ${await response.text()}`);
  }

  const data = (await response.json()) as AdAccountsResponse;
  return (data.elements ?? [])
    .filter((el) => el.id != null)
    .map((el) => ({
      id: String(el.id),
      name: el.name,
      status: el.status,
    }));
}

export type LinkedInCampaign = {
  id: string;
  name: string;
};

type CampaignsResponse = {
  elements?: Array<{ id?: number | string; name?: string }>;
};

export async function listCampaigns(
  accessToken: string,
  adAccountId: string,
): Promise<LinkedInCampaign[]> {
  const accountUrn = `urn:li:sponsoredAccount:${adAccountId}`;
  const search = `(account:(values:List(${accountUrn})))`;
  const url = `${API_BASE}/adCampaigns?q=search&search=${encodeURIComponent(search)}&pageSize=100`;

  const response = await fetch(url, { headers: adsHeaders(accessToken) });
  if (!response.ok) {
    throw new Error(`LinkedIn list campaigns failed (${response.status}): ${await response.text()}`);
  }

  const data = (await response.json()) as CampaignsResponse;
  return (data.elements ?? [])
    .filter((el) => el.id != null)
    .map((el) => ({
      id: String(el.id),
      name: el.name ?? String(el.id),
    }));
}

export type LinkedInAnalyticsRow = {
  date: string;
  campaignId?: string;
  impressions: number;
  clicks: number;
  costMicros: bigint;
  conversions: number;
};

type AnalyticsElement = {
  dateRange?: {
    start?: { year?: number; month?: number; day?: number };
  };
  pivotValues?: string[];
  impressions?: number;
  clicks?: number;
  costInLocalCurrency?: string | number;
  externalWebsiteConversions?: number;
  landingPageClicks?: number;
};

type AnalyticsResponse = {
  elements?: AnalyticsElement[];
};

function dateFromRange(range?: AnalyticsElement["dateRange"]): string | null {
  const s = range?.start;
  if (!s?.year || !s?.month || !s?.day) return null;
  const m = String(s.month).padStart(2, "0");
  const d = String(s.day).padStart(2, "0");
  return `${s.year}-${m}-${d}`;
}

function campaignIdFromPivot(pivotValues?: string[]): string | undefined {
  const urn = pivotValues?.[0];
  if (!urn) return undefined;
  const match = /sponsoredCampaign:(\d+)/.exec(urn);
  return match?.[1];
}

async function fetchAdAnalytics(
  accessToken: string,
  adAccountId: string,
  from: Date,
  to: Date,
  pivot: "ACCOUNT" | "CAMPAIGN",
): Promise<LinkedInAnalyticsRow[]> {
  const accountUrn = encodeURIComponent(`urn:li:sponsoredAccount:${adAccountId}`);
  const dateRange = encodeURIComponent(toLinkedInDateRange(from, to));
  const fields = encodeURIComponent(
    "impressions,clicks,costInLocalCurrency,externalWebsiteConversions,dateRange,pivotValues",
  );

  const url =
    `${API_BASE}/adAnalytics?q=analytics` +
    `&pivot=${pivot}` +
    `&timeGranularity=DAILY` +
    `&dateRange=${dateRange}` +
    `&accounts=List(${accountUrn})` +
    `&fields=${fields}`;

  const response = await fetch(url, { headers: adsHeaders(accessToken) });
  if (!response.ok) {
    throw new Error(
      `LinkedIn adAnalytics (${pivot}) failed (${response.status}): ${await response.text()}`,
    );
  }

  const data = (await response.json()) as AnalyticsResponse;
  const rows: LinkedInAnalyticsRow[] = [];

  for (const el of data.elements ?? []) {
    const date = dateFromRange(el.dateRange);
    if (!date) continue;

    const impressions = Number(el.impressions ?? 0);
    const clicks = Number(el.clicks ?? 0);
    const conversions = Number(el.externalWebsiteConversions ?? 0);

    rows.push({
      date,
      campaignId: pivot === "CAMPAIGN" ? campaignIdFromPivot(el.pivotValues) : undefined,
      impressions,
      clicks,
      costMicros: currencyToMicros(el.costInLocalCurrency),
      conversions,
    });
  }

  return rows;
}

export async function fetchAccountDailyMetrics(
  accessToken: string,
  adAccountId: string,
  from: Date,
  to: Date,
): Promise<LinkedInAnalyticsRow[]> {
  return fetchAdAnalytics(accessToken, adAccountId, from, to, "ACCOUNT");
}

export async function fetchCampaignDailyMetrics(
  accessToken: string,
  adAccountId: string,
  from: Date,
  to: Date,
): Promise<LinkedInAnalyticsRow[]> {
  return fetchAdAnalytics(accessToken, adAccountId, from, to, "CAMPAIGN");
}

export { redirectUri as getLinkedInAdsRedirectUri };
