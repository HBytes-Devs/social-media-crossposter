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

const SCOPES = ["tweet.read", "tweet.write", "users.read", "offline.access"];

type TwitterTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
};

type TwitterUser = {
  data: { id: string; name: string; username: string };
};

export class TwitterAdapter implements PlatformAdapter {
  platform = "TWITTER" as const;

  getAuthUrl(state: string, options?: { codeChallenge?: string }): string {
    if (!options?.codeChallenge) {
      throw new Error("Twitter OAuth requires PKCE code challenge");
    }

    const params = new URLSearchParams({
      response_type: "code",
      client_id: env.TWITTER_CLIENT_ID!,
      redirect_uri: env.TWITTER_REDIRECT_URI!,
      scope: SCOPES.join(" "),
      state,
      code_challenge: options.codeChallenge,
      code_challenge_method: "S256",
    });

    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  }

  async handleCallback(
    code: string,
    oauthExtras?: Record<string, unknown>,
  ): Promise<TokenResult> {
    const verifier = oauthExtras?.pkce as string | undefined;
    if (!verifier) {
      throw new Error("Missing PKCE verifier in OAuth state");
    }

    const basicAuth = Buffer.from(
      `${env.TWITTER_CLIENT_ID!}:${env.TWITTER_CLIENT_SECRET!}`,
    ).toString("base64");

    const tokenData = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: env.TWITTER_REDIRECT_URI!,
        code_verifier: verifier,
      }),
    });

    if (!tokenData.ok) {
      throw new Error(`Twitter token exchange failed: ${await tokenData.text()}`);
    }

    const tokenJson = (await tokenData.json()) as TwitterTokenResponse;

    const user = await fetchJson<TwitterUser>("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });

    return {
      accessToken: tokenJson.access_token,
      refreshToken: tokenJson.refresh_token,
      expiresAt: new Date(Date.now() + tokenJson.expires_in * 1000),
      scopes: tokenJson.scope.split(" "),
      accountId: user.data.id,
      accountName: `@${user.data.username}`,
      metadata: {
        username: user.data.username,
        name: user.data.name,
      },
    };
  }

  async refreshToken(_accessToken: string, refreshToken?: string): Promise<TokenResult> {
    if (!refreshToken) {
      throw new Error("No refresh token for Twitter");
    }

    const basicAuth = Buffer.from(
      `${env.TWITTER_CLIENT_ID!}:${env.TWITTER_CLIENT_SECRET!}`,
    ).toString("base64");

    const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Twitter refresh failed: ${await tokenResponse.text()}`);
    }

    const tokenData = (await tokenResponse.json()) as TwitterTokenResponse;

    const user = await fetchJson<TwitterUser>("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token ?? refreshToken,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      scopes: tokenData.scope.split(" "),
      accountId: user.data.id,
      accountName: `@${user.data.username}`,
    };
  }

  async publishPost(
    post: UnifiedPost,
    accessToken: string,
    _accountId: string,
  ): Promise<PublishResult> {
    try {
      const text = post.customContent ?? post.content;
      const body: Record<string, unknown> = { text };

      if (post.images.length > 0) {
        const mediaId = await this.uploadMedia(accessToken, post.images[0]);
        body.media = { media_ids: [mediaId] };
      }

      const response = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        return { success: false, error: await response.text() };
      }

      const data = (await response.json()) as { data: { id: string } };
      return { success: true, platformPostId: data.data.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Twitter publish failed",
      };
    }
  }

  validateContent(post: UnifiedPost): ValidationResult {
    const errors: string[] = [];
    const text = post.customContent ?? post.content;

    if (!text.trim() && post.images.length === 0) {
      errors.push("Post must have text or at least one image");
    }

    if (text.length > 280) {
      errors.push("X (Twitter) text limit is 280 characters (standard)");
    }

    if (post.images.length > 4) {
      errors.push("X supports maximum 4 images");
    }

    return { valid: errors.length === 0, errors };
  }

  getLimits() {
    return { maxTextLength: 280, maxImages: 4 };
  }

  private async uploadMedia(accessToken: string, imageUrl: string): Promise<string> {
    const { buffer, mimeType } = await downloadImageBytes(imageUrl);

    const initResponse = await fetch("https://upload.twitter.com/1.1/media/upload.json", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        command: "INIT",
        total_bytes: String(buffer.length),
        media_type: mimeType,
      }),
    });

    if (!initResponse.ok) {
      throw new Error(`Twitter media init failed: ${await initResponse.text()}`);
    }

    const initData = (await initResponse.json()) as { media_id_string: string };

    const appendForm = new FormData();
    appendForm.append("command", "APPEND");
    appendForm.append("media_id", initData.media_id_string);
    appendForm.append("segment_index", "0");
    appendForm.append("media", new Blob([buffer]), "image");

    const appendResponse = await fetch("https://upload.twitter.com/1.1/media/upload.json", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: appendForm,
    });

    if (!appendResponse.ok) {
      throw new Error(`Twitter media append failed: ${await appendResponse.text()}`);
    }

    const finalizeResponse = await fetch("https://upload.twitter.com/1.1/media/upload.json", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        command: "FINALIZE",
        media_id: initData.media_id_string,
      }),
    });

    if (!finalizeResponse.ok) {
      throw new Error(`Twitter media finalize failed: ${await finalizeResponse.text()}`);
    }

    return initData.media_id_string;
  }
}

export const twitterAdapter = new TwitterAdapter();
