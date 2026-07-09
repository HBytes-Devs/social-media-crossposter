import { env } from "../../config/env.js";
import { downloadImageBytes } from "../../config/s3.js";
import type {
  PlatformAdapter,
  PublishResult,
  TokenResult,
  UnifiedPost,
  ValidationResult,
} from "../platform.types.js";
import { fetchJson } from "../platform.config.js";

const SCOPES = ["identity", "submit", "read"];

type RedditTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
};

type RedditMeResponse = {
  name: string;
  id: string;
};

type RedditAssetResponse = {
  asset?: { asset_id?: string; websocket_url?: string };
  args?: {
    action?: string;
    fields?: Array<{ name: string; value: string }>;
  };
};

function userAgent(): string {
  return env.REDDIT_USER_AGENT ?? "windows:com.smc.crossposter:v1.0 (by /u/smc_user)";
}

function redditHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    "User-Agent": userAgent(),
  };
}

function normalizeSubreddit(raw: string): string {
  return raw.trim().replace(/^r\//i, "");
}

export class RedditAdapter implements PlatformAdapter {
  platform = "REDDIT" as const;

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: env.REDDIT_CLIENT_ID!,
      response_type: "code",
      state,
      redirect_uri: env.REDDIT_REDIRECT_URI!,
      duration: "permanent",
      scope: SCOPES.join(" "),
    });

    return `https://www.reddit.com/api/v1/authorize?${params.toString()}`;
  }

  async handleCallback(code: string): Promise<TokenResult> {
    const basicAuth = Buffer.from(
      `${env.REDDIT_CLIENT_ID!}:${env.REDDIT_CLIENT_SECRET!}`,
    ).toString("base64");

    const tokenResponse = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: env.REDDIT_REDIRECT_URI!,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Reddit token exchange failed: ${await tokenResponse.text()}`);
    }

    const tokenData = (await tokenResponse.json()) as RedditTokenResponse;

    const me = await fetchJson<RedditMeResponse>("https://oauth.reddit.com/api/v1/me", {
      headers: redditHeaders(tokenData.access_token),
    });

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      scopes: tokenData.scope.split(" "),
      accountId: me.id,
      accountName: `u/${me.name}`,
      metadata: { username: me.name },
    };
  }

  async refreshToken(_accessToken: string, refreshToken?: string): Promise<TokenResult> {
    if (!refreshToken) {
      throw new Error("No refresh token for Reddit");
    }

    const tokenResponse = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${env.REDDIT_CLIENT_ID!}:${env.REDDIT_CLIENT_SECRET!}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Reddit refresh failed: ${await tokenResponse.text()}`);
    }

    const tokenData = (await tokenResponse.json()) as RedditTokenResponse;

    const me = await fetchJson<RedditMeResponse>("https://oauth.reddit.com/api/v1/me", {
      headers: redditHeaders(tokenData.access_token),
    });

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token ?? refreshToken,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      scopes: tokenData.scope.split(" "),
      accountId: me.id,
      accountName: `u/${me.name}`,
      metadata: { username: me.name },
    };
  }

  async publishPost(
    post: UnifiedPost,
    accessToken: string,
    _accountId: string,
    metadata?: Record<string, unknown>,
  ): Promise<PublishResult> {
    try {
      const text = post.customContent ?? post.content;
      const subreddit = normalizeSubreddit((metadata?.subreddit as string) ?? "test");
      const title = post.title?.trim() || text.slice(0, 300) || "Post from SMC";

      const params = new URLSearchParams({
        sr: subreddit,
        title,
        api_type: "json",
        resubmit: "true",
      });

      if (post.images.length > 0) {
        const imageUrl = await this.uploadImage(accessToken, post.images[0]);
        params.set("kind", "image");
        params.set("url", imageUrl);
        if (text.trim()) {
          params.set("text", text);
        }
      } else {
        params.set("kind", "self");
        params.set("text", text);
      }

      const response = await fetch("https://oauth.reddit.com/api/submit", {
        method: "POST",
        headers: {
          ...redditHeaders(accessToken),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      if (!response.ok) {
        return { success: false, error: await response.text() };
      }

      const data = (await response.json()) as {
        json?: { errors?: string[][]; data?: { id?: string; url?: string } };
      };

      if (data.json?.errors?.length) {
        return { success: false, error: data.json.errors.flat().join(", ") };
      }

      return {
        success: true,
        platformPostId: data.json?.data?.id ?? data.json?.data?.url,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Reddit publish failed",
      };
    }
  }

  validateContent(post: UnifiedPost): ValidationResult {
    const errors: string[] = [];
    const text = post.customContent ?? post.content;

    if (!text.trim() && post.images.length === 0) {
      errors.push("Post must have text or at least one image");
    }

    if (!post.title?.trim()) {
      errors.push("Reddit posts require a title");
    }

    if (text.length > 40000) {
      errors.push("Reddit body limit is 40000 characters");
    }

    if (post.title && post.title.length > 300) {
      errors.push("Reddit title limit is 300 characters");
    }

    return { valid: errors.length === 0, errors };
  }

  getLimits() {
    return { maxTextLength: 40000, maxImages: 1 };
  }

  private async uploadImage(accessToken: string, imageUrl: string): Promise<string> {
    const { buffer, mimeType } = await downloadImageBytes(imageUrl);
    const ext = mimeType.includes("png") ? "png" : "jpg";
    const filepath = `smc-upload.${ext}`;

    const leaseUrl = `https://oauth.reddit.com/api/media/asset.json?filepath=${encodeURIComponent(filepath)}&mimetype=${encodeURIComponent(mimeType)}`;

    const leaseResponse = await fetch(leaseUrl, {
      method: "POST",
      headers: redditHeaders(accessToken),
    });

    if (!leaseResponse.ok) {
      throw new Error(`Reddit media lease failed: ${await leaseResponse.text()}`);
    }

    const lease = (await leaseResponse.json()) as RedditAssetResponse;

    if (lease.args?.action && lease.args.fields?.length) {
      const s3Form = new FormData();
      for (const field of lease.args.fields) {
        s3Form.append(field.name, field.value);
      }
      s3Form.append("file", new Blob([buffer], { type: mimeType }), filepath);

      const uploadResponse = await fetch(lease.args.action, {
        method: "POST",
        body: s3Form,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Reddit S3 upload failed: ${uploadResponse.status}`);
      }
    }

    if (lease.asset?.websocket_url) {
      return lease.asset.websocket_url.replace(/^wss?:\/\//, "https://");
    }

    throw new Error("Reddit image upload did not return a usable URL");
  }
}

export const redditAdapter = new RedditAdapter();
