import { env } from "../../config/env.js";
import { resolvePublicImageUrl } from "../../config/s3.js";
import type {
  PlatformAdapter,
  PublishResult,
  TokenResult,
  UnifiedPost,
  ValidationResult,
} from "../platform.types.js";
import {
  META_GRAPH_VERSION,
  fetchJson,
  getInstagramRedirectUri,
  pickPreferredMetaPage,
} from "../platform.config.js";

const SCOPES_FACEBOOK_LOGIN = [
  "instagram_basic",
  "instagram_content_publish",
  "pages_show_list",
  "pages_read_engagement",
  "public_profile",
];

const SCOPES_INSTAGRAM_LOGIN = [
  "instagram_business_basic",
  "instagram_business_content_publish",
];

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/** Instagram containers need processing before media_publish (code 9007 otherwise). */
async function waitForMediaContainer(
  base: string,
  containerId: string,
  accessToken: string,
  {
    maxAttempts = 20,
    intervalMs = 2000,
  }: { maxAttempts?: number; intervalMs?: number } = {},
): Promise<void> {
  let lastStatus = "UNKNOWN";
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await fetchJson<{ status_code?: string; status?: string }>(
      `${base}/${containerId}?fields=status_code,status&access_token=${encodeURIComponent(accessToken)}`,
    );
    lastStatus = status.status_code ?? status.status ?? "UNKNOWN";
    if (lastStatus === "FINISHED") return;
    if (lastStatus === "ERROR" || lastStatus === "EXPIRED") {
      throw new Error(`Instagram media container ${lastStatus}`);
    }
    await sleep(intervalMs);
  }
  throw new Error(
    `Instagram media container not ready after ${maxAttempts} polls (last=${lastStatus})`,
  );
}

type MetaTokenResponse = {
  access_token: string;
  expires_in?: number;
  user_id?: number | string;
};

type IgAccountResponse = {
  instagram_business_account?: { id: string };
  connected_instagram_account?: { id: string };
  id: string;
  name: string;
  access_token: string;
};

type MetaPagesResponse = {
  data: IgAccountResponse[];
};

type DebugTokenResponse = {
  data?: {
    granular_scopes?: Array<{ scope: string; target_ids?: string[] }>;
  };
};

type IgResolved = {
  igUserId: string;
  accessToken: string;
  pageId?: string;
  source: string;
  apiHost: "facebook" | "instagram";
};

function useInstagramLogin(): boolean {
  return (env.META_USE_INSTAGRAM_LOGIN ?? "").toLowerCase() === "true";
}

function instagramAppId(): string {
  if (useInstagramLogin()) {
    return env.META_INSTAGRAM_APP_ID?.trim() || "";
  }
  return env.META_INSTAGRAM_APP_ID?.trim() || env.META_APP_ID || "";
}

function instagramAppSecret(): string {
  // Instagram Login must use the Instagram product/app secret (HBytes-IG),
  // NOT the parent Facebook app secret — Meta returns a misleading
  // "redirect_uri" OAuthException when the secret is wrong.
  if (useInstagramLogin()) {
    return env.META_INSTAGRAM_APP_SECRET?.trim() || "";
  }
  return env.META_INSTAGRAM_APP_SECRET?.trim() || env.META_APP_SECRET || "";
}

/** Instagram may append #_ to the redirect; strip if it leaked into the code. */
function normalizeOAuthCode(code: string): string {
  return code.split("#")[0]?.trim() ?? "";
}

async function listGrantedPermissions(userToken: string): Promise<string> {
  try {
    const perms = await fetchJson<{ data: Array<{ permission: string; status: string }> }>(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/me/permissions?access_token=${userToken}`,
    );
    return perms.data
      .filter((x) => x.status === "granted")
      .map((x) => x.permission)
      .join(", ");
  } catch {
    return "(could not read permissions)";
  }
}

async function resolveIgFromPages(
  userToken: string,
): Promise<{ pages: IgAccountResponse[]; match?: IgResolved }> {
  const pages = await fetchJson<MetaPagesResponse>(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/me/accounts?fields=id,name,access_token,instagram_business_account,connected_instagram_account&access_token=${userToken}`,
  );

  const enriched = await Promise.all(
    pages.data.map(async (p) => {
      let igId = p.instagram_business_account?.id ?? p.connected_instagram_account?.id;
      if (!igId) {
        try {
          const detail = await fetchJson<IgAccountResponse>(
            `https://graph.facebook.com/${META_GRAPH_VERSION}/${p.id}?fields=id,name,instagram_business_account,connected_instagram_account&access_token=${p.access_token}`,
          );
          igId =
            detail.instagram_business_account?.id ?? detail.connected_instagram_account?.id;
        } catch {
          // continue
        }
      }
      if (!igId) {
        try {
          const backed = await fetchJson<{ data: Array<{ id: string }> }>(
            `https://graph.facebook.com/${META_GRAPH_VERSION}/${p.id}/page_backed_instagram_accounts?access_token=${p.access_token}`,
          );
          igId = backed.data?.[0]?.id;
        } catch {
          // continue
        }
      }
      return {
        ...p,
        instagram_business_account: igId ? { id: igId } : undefined,
      };
    }),
  );

  const withIg = enriched.filter((p) => p.instagram_business_account?.id);
  const pageWithIg = pickPreferredMetaPage(withIg);
  if (!pageWithIg?.instagram_business_account?.id) {
    return { pages: enriched };
  }

  return {
    pages: enriched,
    match: {
      igUserId: pageWithIg.instagram_business_account.id,
      accessToken: pageWithIg.access_token,
      pageId: pageWithIg.id,
      source: "page_instagram_business_account",
      apiHost: "facebook",
    },
  };
}

async function resolveIgFromGranularScopes(userToken: string): Promise<IgResolved | undefined> {
  if (!env.META_APP_ID || !env.META_APP_SECRET) return undefined;
  try {
    const appToken = `${env.META_APP_ID}|${env.META_APP_SECRET}`;
    const debug = await fetchJson<DebugTokenResponse>(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/debug_token?input_token=${encodeURIComponent(userToken)}&access_token=${encodeURIComponent(appToken)}`,
    );
    const ids = new Set<string>();
    for (const g of debug.data?.granular_scopes ?? []) {
      if (!/^instagram_/i.test(g.scope)) continue;
      for (const id of g.target_ids ?? []) {
        if (id) ids.add(id);
      }
    }
    const igUserId = [...ids][0];
    if (!igUserId) return undefined;
    return {
      igUserId,
      accessToken: userToken,
      source: "oauth_granular_scopes",
      apiHost: "facebook",
    };
  } catch {
    return undefined;
  }
}

async function resolveIgFromBusinesses(userToken: string): Promise<IgResolved | undefined> {
  try {
    const businesses = await fetchJson<{ data: Array<{ id: string; name?: string }> }>(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/me/businesses?fields=id,name&access_token=${userToken}`,
    );
    for (const biz of businesses.data ?? []) {
      for (const edge of ["owned_instagram_accounts", "client_instagram_accounts"] as const) {
        try {
          const igs = await fetchJson<{ data: Array<{ id: string; username?: string }> }>(
            `https://graph.facebook.com/${META_GRAPH_VERSION}/${biz.id}/${edge}?fields=id,username&access_token=${userToken}`,
          );
          const hit =
            igs.data.find((x) => x.username?.toLowerCase().includes("hawkbytes")) ?? igs.data[0];
          if (hit?.id) {
            return {
              igUserId: hit.id,
              accessToken: userToken,
              source: `business_${edge}`,
              apiHost: "facebook",
            };
          }
        } catch {
          // next
        }
      }
    }
  } catch {
    // none
  }
  return undefined;
}

async function exchangeInstagramLoginCode(code: string): Promise<TokenResult> {
  const clientId = instagramAppId();
  const clientSecret = instagramAppSecret();
  const redirectUri = getInstagramRedirectUri();
  if (!clientId || !clientSecret) {
    throw new Error(
      "Instagram Login requires META_INSTAGRAM_APP_ID and META_INSTAGRAM_APP_SECRET from the Instagram app (HBytes-IG), not the Facebook app secret",
    );
  }

  const form = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code: normalizeOAuthCode(code),
  });

  let short: MetaTokenResponse & { user_id?: number | string };
  try {
    short = await fetchJson<MetaTokenResponse & { user_id?: number | string }>(
      "https://api.instagram.com/oauth/access_token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/redirect_uri|verification code/i.test(msg)) {
      throw new Error(
        `${msg} — Usually wrong META_INSTAGRAM_APP_SECRET (must be HBytes-IG Instagram App Secret, not Facebook), or redirect_uri mismatch. Expected redirect_uri=${redirectUri}`,
      );
    }
    throw err;
  }

  let accessToken = short.access_token;
  let expiresAt: Date | undefined = short.expires_in
    ? new Date(Date.now() + short.expires_in * 1000)
    : undefined;

  try {
    const longLived = await fetchJson<MetaTokenResponse>(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${encodeURIComponent(clientSecret)}&access_token=${encodeURIComponent(short.access_token)}`,
    );
    accessToken = longLived.access_token;
    if (longLived.expires_in) {
      expiresAt = new Date(Date.now() + longLived.expires_in * 1000);
    }
  } catch {
    // keep short-lived token
  }

  const me = await fetchJson<{ user_id?: string; id?: string; username?: string }>(
    `https://graph.instagram.com/${META_GRAPH_VERSION}/me?fields=user_id,username&access_token=${encodeURIComponent(accessToken)}`,
  );

  const igUserId = String(me.user_id ?? me.id ?? short.user_id ?? "");
  if (!igUserId) {
    throw new Error("Instagram Login succeeded but no user_id returned");
  }

  return {
    accessToken,
    expiresAt,
    scopes: SCOPES_INSTAGRAM_LOGIN,
    accountId: igUserId,
    accountName: me.username ?? "Instagram",
    metadata: {
      igUserId,
      type: "instagram_login",
      apiHost: "instagram",
      resolveSource: "instagram_oauth",
    },
  };
}

export class InstagramAdapter implements PlatformAdapter {
  platform = "INSTAGRAM" as const;

  getAuthUrl(state: string): string {
    if (useInstagramLogin()) {
      const params = new URLSearchParams({
        client_id: instagramAppId(),
        redirect_uri: getInstagramRedirectUri(),
        state,
        response_type: "code",
        scope: SCOPES_INSTAGRAM_LOGIN.join(","),
      });
      return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
    }

    const params = new URLSearchParams({
      client_id: env.META_APP_ID!,
      redirect_uri: getInstagramRedirectUri(),
      state,
      response_type: "code",
      auth_type: "rerequest",
    });

    if (env.META_CONFIG_ID) {
      params.set("config_id", env.META_CONFIG_ID);
    } else if (env.META_INSTAGRAM_USE_BUSINESS_SCOPES === "true") {
      params.set(
        "scope",
        [
          "instagram_business_basic",
          "instagram_business_content_publish",
          "pages_show_list",
          "pages_read_engagement",
          "public_profile",
        ].join(","),
      );
    } else {
      params.set("scope", SCOPES_FACEBOOK_LOGIN.join(","));
    }

    return `https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
  }

  async handleCallback(code: string): Promise<TokenResult> {
    if (useInstagramLogin()) {
      return exchangeInstagramLoginCode(code);
    }

    const tokenUrl = new URL(`https://graph.facebook.com/${META_GRAPH_VERSION}/oauth/access_token`);
    tokenUrl.searchParams.set("client_id", env.META_APP_ID!);
    tokenUrl.searchParams.set("client_secret", env.META_APP_SECRET!);
    tokenUrl.searchParams.set("redirect_uri", getInstagramRedirectUri());
    tokenUrl.searchParams.set("code", code);

    const tokenData = await fetchJson<MetaTokenResponse>(tokenUrl.toString());
    const userToken = tokenData.access_token;

    const fromPages = await resolveIgFromPages(userToken);
    const resolved =
      fromPages.match ??
      (await resolveIgFromGranularScopes(userToken)) ??
      (await resolveIgFromBusinesses(userToken));

    if (!resolved) {
      const preferred = env.META_PREFERRED_PAGE_NAME?.trim() || "your preferred Page";
      const granted = await listGrantedPermissions(userToken);
      const found =
        fromPages.pages.length === 0
          ? "no Pages returned"
          : fromPages.pages.map((p) => `${p.name} (no Instagram Business link)`).join("; ");
      throw new Error(
        `No Instagram Business account found for publishing. Preferred Page: ${preferred}. Found Pages: ${found}. ` +
          `Granted permissions: ${granted}. ` +
          `Facebook Login path needs @hawkbytes linked to HawkBytes Page. ` +
          `Or set META_USE_INSTAGRAM_LOGIN=true with Instagram App ID/Secret (Instagram Login — no Page link required).`,
      );
    }

    let accountName = "Instagram";
    try {
      const igProfile = await fetchJson<{ username?: string; name?: string }>(
        `https://graph.facebook.com/${META_GRAPH_VERSION}/${resolved.igUserId}?fields=username,name&access_token=${resolved.accessToken}`,
      );
      accountName = igProfile.username ?? igProfile.name ?? accountName;
    } catch {
      // keep default
    }

    const preferredPage = pickPreferredMetaPage(fromPages.pages);

    return {
      accessToken: resolved.accessToken,
      expiresAt: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : undefined,
      scopes: SCOPES_FACEBOOK_LOGIN,
      accountId: resolved.igUserId,
      accountName,
      metadata: {
        igUserId: resolved.igUserId,
        pageId: resolved.pageId ?? preferredPage?.id,
        pageAccessToken: preferredPage?.access_token,
        type: "instagram_business",
        apiHost: resolved.apiHost,
        resolveSource: resolved.source,
      },
    };
  }

  async refreshToken(accessToken: string): Promise<TokenResult> {
    if (useInstagramLogin()) {
      const refreshed = await fetchJson<MetaTokenResponse>(
        `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(accessToken)}`,
      );
      return {
        accessToken: refreshed.access_token,
        expiresAt: refreshed.expires_in
          ? new Date(Date.now() + refreshed.expires_in * 1000)
          : undefined,
        scopes: SCOPES_INSTAGRAM_LOGIN,
        accountId: "instagram",
        accountName: "Instagram",
      };
    }

    const url = new URL(`https://graph.facebook.com/${META_GRAPH_VERSION}/oauth/access_token`);
    url.searchParams.set("grant_type", "fb_exchange_token");
    url.searchParams.set("client_id", env.META_APP_ID!);
    url.searchParams.set("client_secret", env.META_APP_SECRET!);
    url.searchParams.set("fb_exchange_token", accessToken);

    const tokenData = await fetchJson<MetaTokenResponse>(url.toString());

    return {
      accessToken: tokenData.access_token,
      expiresAt: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : undefined,
      scopes: SCOPES_FACEBOOK_LOGIN,
      accountId: "instagram",
      accountName: "Instagram",
    };
  }

  async publishPost(
    post: UnifiedPost,
    accessToken: string,
    accountId: string,
    metadata?: Record<string, unknown>,
  ): Promise<PublishResult> {
    try {
      const igUserId = (metadata?.igUserId as string) ?? accountId;
      const text = post.customContent ?? post.content;
      const apiHost = metadata?.apiHost === "instagram" ? "instagram" : "facebook";
      const base =
        apiHost === "instagram"
          ? `https://graph.instagram.com/${META_GRAPH_VERSION}`
          : `https://graph.facebook.com/${META_GRAPH_VERSION}`;

      if (post.images.length === 0) {
        return {
          success: false,
          error: "Instagram requires at least one image",
        };
      }

      const imageUrl = await resolvePublicImageUrl(post.images[0]);

      const container = await fetchJson<{ id: string }>(`${base}/${igUserId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: text,
          access_token: accessToken,
        }),
      });

      await waitForMediaContainer(base, container.id, accessToken);

      const published = await fetchJson<{ id: string }>(`${base}/${igUserId}/media_publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: container.id,
          access_token: accessToken,
        }),
      });

      return { success: true, platformPostId: published.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Instagram publish failed",
      };
    }
  }

  validateContent(post: UnifiedPost): ValidationResult {
    const errors: string[] = [];
    const text = post.customContent ?? post.content;

    if (post.images.length === 0) {
      errors.push("Instagram requires at least one image");
    }

    if (text.length > 2200) {
      errors.push("Instagram caption limit is 2200 characters");
    }

    if (post.images.length > 10) {
      errors.push("Instagram supports maximum 10 images per carousel (single image for now)");
    }

    return { valid: errors.length === 0, errors };
  }

  getLimits() {
    return { maxTextLength: 2200, maxImages: 10 };
  }
}

export const instagramAdapter = new InstagramAdapter();
