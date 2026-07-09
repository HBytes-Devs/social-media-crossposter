import { env } from "../../config/env.js";
import { downloadImageBytes } from "../../config/s3.js";
import type {
  PlatformAdapter,
  PublishResult,
  TokenResult,
  UnifiedPost,
  ValidationResult,
} from "../platform.types.js";
import { META_GRAPH_VERSION, fetchJson } from "../platform.config.js";

const SCOPES = [
  "pages_manage_posts",
  "pages_read_engagement",
  "pages_show_list",
  "public_profile",
];

type MetaTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in?: number;
};

type MetaPage = {
  id: string;
  name: string;
  access_token: string;
};

type MetaPagesResponse = {
  data: MetaPage[];
};

export class FacebookAdapter implements PlatformAdapter {
  platform = "FACEBOOK" as const;

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: env.META_APP_ID!,
      redirect_uri: env.META_REDIRECT_URI!,
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
    tokenUrl.searchParams.set("redirect_uri", env.META_REDIRECT_URI!);
    tokenUrl.searchParams.set("code", code);

    const tokenData = await fetchJson<MetaTokenResponse>(tokenUrl.toString());
    const pages = await fetchJson<MetaPagesResponse>(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/me/accounts?fields=id,name,access_token&access_token=${tokenData.access_token}`,
    );

    const page = pages.data[0];
    if (!page) {
      throw new Error("No Facebook Page found. Create a Page and grant access.");
    }

    return {
      accessToken: page.access_token,
      expiresAt: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : undefined,
      scopes: SCOPES,
      accountId: page.id,
      accountName: page.name,
      metadata: {
        pageId: page.id,
        pageName: page.name,
        type: "facebook_page",
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
      accountId: "facebook",
      accountName: "Facebook Page",
    };
  }

  async publishPost(
    post: UnifiedPost,
    accessToken: string,
    accountId: string,
    metadata?: Record<string, unknown>,
  ): Promise<PublishResult> {
    try {
      const pageId = (metadata?.pageId as string) ?? accountId;
      const text = post.customContent ?? post.content;

      if (post.images.length > 0) {
        const { buffer } = await downloadImageBytes(post.images[0]);
        const form = new FormData();
        form.append("message", text);
        form.append("access_token", accessToken);
        form.append("source", new Blob([buffer]), "image.jpg");

        const response = await fetch(
          `https://graph.facebook.com/${META_GRAPH_VERSION}/${pageId}/photos`,
          { method: "POST", body: form },
        );

        if (!response.ok) {
          return { success: false, error: await response.text() };
        }

        const data = (await response.json()) as { id?: string; post_id?: string };
        return { success: true, platformPostId: data.post_id ?? data.id };
      }

      const body = new URLSearchParams({
        message: text,
        access_token: accessToken,
      });

      const response = await fetch(
        `https://graph.facebook.com/${META_GRAPH_VERSION}/${pageId}/feed`,
        { method: "POST", body },
      );

      if (!response.ok) {
        return { success: false, error: await response.text() };
      }

      const data = (await response.json()) as { id: string };
      return { success: true, platformPostId: data.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Facebook publish failed",
      };
    }
  }

  validateContent(post: UnifiedPost): ValidationResult {
    const errors: string[] = [];
    const text = post.customContent ?? post.content;

    if (!text.trim() && post.images.length === 0) {
      errors.push("Post must have text or at least one image");
    }

    if (text.length > 63206) {
      errors.push("Facebook text limit is 63206 characters");
    }

    return { valid: errors.length === 0, errors };
  }

  getLimits() {
    return { maxTextLength: 63206, maxImages: 10 };
  }
}

export const facebookAdapter = new FacebookAdapter();
