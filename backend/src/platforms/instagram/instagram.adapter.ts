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
} from "../platform.config.js";

const SCOPES = [
  "instagram_basic",
  "instagram_content_publish",
  "pages_show_list",
  "pages_read_engagement",
  "public_profile",
];

type MetaTokenResponse = {
  access_token: string;
  expires_in?: number;
};

type IgAccountResponse = {
  instagram_business_account?: { id: string };
  id: string;
  name: string;
  access_token: string;
};

type MetaPagesResponse = {
  data: IgAccountResponse[];
};

export class InstagramAdapter implements PlatformAdapter {
  platform = "INSTAGRAM" as const;

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: env.META_APP_ID!,
      redirect_uri: getInstagramRedirectUri(),
      state,
      scope: SCOPES.join(","),
      response_type: "code",
    });

    return `https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
  }

  async handleCallback(code: string): Promise<TokenResult> {
    const tokenUrl = new URL(`https://graph.facebook.com/${META_GRAPH_VERSION}/oauth/access_token`);
    tokenUrl.searchParams.set("client_id", env.META_APP_ID!);
    tokenUrl.searchParams.set("client_secret", env.META_APP_SECRET!);
    tokenUrl.searchParams.set("redirect_uri", getInstagramRedirectUri());
    tokenUrl.searchParams.set("code", code);

    const tokenData = await fetchJson<MetaTokenResponse>(tokenUrl.toString());

    const pages = await fetchJson<MetaPagesResponse>(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${tokenData.access_token}`,
    );

    const pageWithIg = pages.data.find((p) => p.instagram_business_account?.id);
    if (!pageWithIg?.instagram_business_account) {
      throw new Error(
        "No Instagram Business account linked to your Facebook Page. Connect IG to a Page first.",
      );
    }

    const igUserId = pageWithIg.instagram_business_account.id;

    const igProfile = await fetchJson<{ username?: string; name?: string }>(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/${igUserId}?fields=username,name&access_token=${pageWithIg.access_token}`,
    );

    return {
      accessToken: pageWithIg.access_token,
      expiresAt: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : undefined,
      scopes: SCOPES,
      accountId: igUserId,
      accountName: igProfile.username ?? igProfile.name ?? "Instagram",
      metadata: {
        igUserId,
        pageId: pageWithIg.id,
        pageAccessToken: pageWithIg.access_token,
        type: "instagram_business",
      },
    };
  }

  async refreshToken(accessToken: string): Promise<TokenResult> {
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
      scopes: SCOPES,
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

      if (post.images.length === 0) {
        return {
          success: false,
          error: "Instagram requires at least one image",
        };
      }

      const imageUrl = await resolvePublicImageUrl(post.images[0]);

      const container = await fetchJson<{ id: string }>(
        `https://graph.facebook.com/${META_GRAPH_VERSION}/${igUserId}/media`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_url: imageUrl,
            caption: text,
            access_token: accessToken,
          }),
        },
      );

      const published = await fetchJson<{ id: string }>(
        `https://graph.facebook.com/${META_GRAPH_VERSION}/${igUserId}/media_publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creation_id: container.id,
            access_token: accessToken,
          }),
        },
      );

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
