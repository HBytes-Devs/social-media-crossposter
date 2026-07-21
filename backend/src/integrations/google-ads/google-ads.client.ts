import { env } from "../../config/env.js";
import { GOOGLE_ADS_API_VERSION, GOOGLE_ADS_SCOPE } from "./google-ads.types.js";

export function isGoogleAdsConfigured(): boolean {
  return Boolean(
    env.GOOGLE_ADS_CLIENT_ID &&
      env.GOOGLE_ADS_CLIENT_SECRET &&
      env.GOOGLE_ADS_REDIRECT_URI &&
      env.GOOGLE_ADS_DEVELOPER_TOKEN,
  );
}

export function getGoogleAdsAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_ADS_CLIENT_ID!,
    redirect_uri: env.GOOGLE_ADS_REDIRECT_URI!,
    response_type: "code",
    scope: GOOGLE_ADS_SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export type GoogleTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
};

export async function exchangeGoogleAuthCode(code: string): Promise<GoogleTokenResponse> {
  const body = new URLSearchParams({
    code,
    client_id: env.GOOGLE_ADS_CLIENT_ID!,
    client_secret: env.GOOGLE_ADS_CLIENT_SECRET!,
    redirect_uri: env.GOOGLE_ADS_REDIRECT_URI!,
    grant_type: "authorization_code",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error(`Google token exchange failed (${response.status}): ${await response.text()}`);
  }

  return response.json() as Promise<GoogleTokenResponse>;
}

export async function refreshGoogleAccessToken(refreshToken: string): Promise<GoogleTokenResponse> {
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: env.GOOGLE_ADS_CLIENT_ID!,
    client_secret: env.GOOGLE_ADS_CLIENT_SECRET!,
    grant_type: "refresh_token",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error(`Google token refresh failed (${response.status}): ${await response.text()}`);
  }

  return response.json() as Promise<GoogleTokenResponse>;
}

type SearchRow = {
  customer?: { id?: string; descriptiveName?: string };
  campaign?: { id?: string; name?: string };
  segments?: { date?: string };
  metrics?: {
    impressions?: string;
    clicks?: string;
    costMicros?: string;
    conversions?: number;
    ctr?: number;
  };
};

type SearchResponse = {
  results?: SearchRow[];
};

function googleAdsHeaders(accessToken: string, loginCustomerId?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    "Content-Type": "application/json",
  };

  if (loginCustomerId) {
    headers["login-customer-id"] = loginCustomerId.replace(/-/g, "");
  }

  return headers;
}

export async function listAccessibleCustomers(accessToken: string): Promise<string[]> {
  let response: Response;
  try {
    response = await fetch(
      `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers:listAccessibleCustomers`,
      { headers: googleAdsHeaders(accessToken) },
    );
  } catch (err) {
    throw new Error(
      `Could not reach Google Ads API (${err instanceof Error ? err.message : "network error"}). Check internet and try again.`,
    );
  }

  if (!response.ok) {
    throw new Error(await formatGoogleAdsHttpError("list customers", response));
  }

  const data = (await response.json()) as { resourceNames?: string[] };
  return (data.resourceNames ?? []).map((name) => name.replace("customers/", ""));
}

export async function fetchCustomerName(
  accessToken: string,
  customerId: string,
  loginCustomerId?: string | null,
): Promise<string | null> {
  const query = `
    SELECT customer.descriptive_name
    FROM customer
    LIMIT 1
  `;

  const rows = await searchGoogleAds(accessToken, customerId, query, loginCustomerId);
  return rows[0]?.customer?.descriptiveName ?? null;
}

export async function searchGoogleAds(
  accessToken: string,
  customerId: string,
  query: string,
  loginCustomerId?: string | null,
): Promise<SearchRow[]> {
  let response: Response;
  try {
    response = await fetch(
      `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${customerId.replace(/-/g, "")}/googleAds:search`,
      {
        method: "POST",
        headers: googleAdsHeaders(accessToken, loginCustomerId),
        body: JSON.stringify({ query }),
      },
    );
  } catch (err) {
    throw new Error(
      `Could not reach Google Ads API (${err instanceof Error ? err.message : "network error"}). Check internet and try again.`,
    );
  }

  if (!response.ok) {
    throw new Error(await formatGoogleAdsHttpError("search", response));
  }

  const data = (await response.json()) as SearchResponse;
  return data.results ?? [];
}

async function formatGoogleAdsHttpError(action: string, response: Response): Promise<string> {
  const body = await response.text();

  if (body.includes("DEVELOPER_TOKEN_NOT_APPROVED")) {
    return (
      "Google Ads developer token is Test Access only. Real accounts cannot sync until Basic Access is approved. " +
      "Check API Center / your application email — usually ~5 business days."
    );
  }

  if (body.includes("PERMISSION_DENIED")) {
    return `Google Ads permission denied during ${action}. Check developer token access level and account linking.`;
  }

  // Avoid dumping huge HTML 404 pages into the UI
  if (body.trimStart().startsWith("<!DOCTYPE") || body.includes("<html")) {
    return `Google Ads ${action} failed (${response.status}): unexpected HTML response (often wrong API version or blocked request).`;
  }

  const trimmed = body.length > 500 ? `${body.slice(0, 500)}…` : body;
  return `Google Ads ${action} failed (${response.status}): ${trimmed}`;
}
