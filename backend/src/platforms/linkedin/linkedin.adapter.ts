import { env } from "../../config/env.js";
import { downloadImageBytes } from "../../config/s3.js";
import type {
  PlatformAdapter,
  PublishResult,
  TokenResult,
  UnifiedPost,
  ValidationResult,
} from "../platform.types.js";

const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo";
const LINKEDIN_API_BASE = "https://api.linkedin.com/rest";
const LINKEDIN_VERSION = env.LINKEDIN_API_VERSION;

const SCOPES = ["openid", "profile", "w_member_social", "email"];

type LinkedInTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope: string;
};

type LinkedInUserInfo = {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  picture?: string;
};

export class LinkedInAdapter implements PlatformAdapter {
  platform = "LINKEDIN" as const;

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: env.LINKEDIN_CLIENT_ID!,
      redirect_uri: env.LINKEDIN_REDIRECT_URI!,
      state,
      scope: SCOPES.join(" "),
    });

    return `${LINKEDIN_AUTH_URL}?${params.toString()}`;
  }

  async handleCallback(code: string, _oauthExtras?: Record<string, unknown>): Promise<TokenResult> {
    const tokenData = await this.exchangeCode(code);
    const userInfo = await this.getUserInfo(tokenData.access_token);

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      scopes: tokenData.scope.split(" "),
      accountId: userInfo.sub,
      accountName: userInfo.name ?? userInfo.email ?? "LinkedIn User",
      metadata: {
        email: userInfo.email,
        picture: userInfo.picture,
        authorUrn: `urn:li:person:${userInfo.sub}`,
      },
    };
  }

  async refreshToken(_accessToken: string, refreshToken?: string): Promise<TokenResult> {
    if (!refreshToken) {
      throw new Error("No refresh token available for LinkedIn");
    }

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: env.LINKEDIN_CLIENT_ID!,
      client_secret: env.LINKEDIN_CLIENT_SECRET!,
    });

    const response = await fetch(LINKEDIN_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`LinkedIn token refresh failed: ${response.status}`);
    }

    const tokenData = (await response.json()) as LinkedInTokenResponse;
    const userInfo = await this.getUserInfo(tokenData.access_token);

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token ?? refreshToken,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      scopes: tokenData.scope.split(" "),
      accountId: userInfo.sub,
      accountName: userInfo.name ?? userInfo.email,
      metadata: {
        email: userInfo.email,
        picture: userInfo.picture,
        authorUrn: `urn:li:person:${userInfo.sub}`,
      },
    };
  }

  async publishPost(
    post: UnifiedPost,
    accessToken: string,
    accountId: string,
    metadata?: Record<string, unknown>,
  ): Promise<PublishResult> {
    try {
      const authorUrn =
        (metadata?.authorUrn as string) ?? `urn:li:person:${accountId}`;
      const text = post.customContent ?? post.content;

      const body: Record<string, unknown> = {
        author: authorUrn,
        commentary: text,
        visibility: "PUBLIC",
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
      };

      // Image support — upload first if images present
      if (post.images.length > 0) {
        const imageUrn = await this.uploadImage(accessToken, authorUrn, post.images[0]);
        body.content = {
          media: {
            id: imageUrn,
          },
        };
      }

      const response = await fetch(`${LINKEDIN_API_BASE}/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "LinkedIn-Version": LINKEDIN_VERSION,
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `LinkedIn API error: ${errorText}` };
      }

      const postId = response.headers.get("x-restli-id") ?? "published";

      return { success: true, platformPostId: postId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  validateContent(post: UnifiedPost): ValidationResult {
    const errors: string[] = [];
    const text = post.customContent ?? post.content;

    if (!text.trim() && post.images.length === 0) {
      errors.push("Post must have text or at least one image");
    }

    if (text.length > 3000) {
      errors.push("LinkedIn text limit is 3000 characters");
    }

    if (post.images.length > 9) {
      errors.push("LinkedIn supports maximum 9 images");
    }

    return { valid: errors.length === 0, errors };
  }

  getLimits() {
    return { maxTextLength: 3000, maxImages: 9 };
  }

  private async exchangeCode(code: string): Promise<LinkedInTokenResponse> {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: env.LINKEDIN_CLIENT_ID!,
      client_secret: env.LINKEDIN_CLIENT_SECRET!,
      redirect_uri: env.LINKEDIN_REDIRECT_URI!,
    });

    const response = await fetch(LINKEDIN_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LinkedIn token exchange failed: ${error}`);
    }

    return response.json() as Promise<LinkedInTokenResponse>;
  }

  private async getUserInfo(accessToken: string): Promise<LinkedInUserInfo> {
    const response = await fetch(LINKEDIN_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`LinkedIn userinfo failed: ${response.status}`);
    }

    return response.json() as Promise<LinkedInUserInfo>;
  }

  private async uploadImage(
    accessToken: string,
    authorUrn: string,
    imageUrl: string,
  ): Promise<string> {
    // Step 1: Initialize upload
    const initResponse = await fetch(
      `${LINKEDIN_API_BASE}/images?action=initializeUpload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "LinkedIn-Version": LINKEDIN_VERSION,
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          initializeUploadRequest: {
            owner: authorUrn,
          },
        }),
      },
    );

    if (!initResponse.ok) {
      throw new Error(`LinkedIn image init failed: ${await initResponse.text()}`);
    }

    const initData = (await initResponse.json()) as {
      value: { uploadUrl: string; image: string };
    };

    const { buffer, mimeType } = await downloadImageBytes(imageUrl);

    // Step 3: Upload binary to LinkedIn (raw body, not multipart)
    const uploadResponse = await fetch(initData.value.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": mimeType },
      body: buffer,
    });

    if (!uploadResponse.ok) {
      throw new Error(`LinkedIn image upload failed: ${uploadResponse.status}`);
    }

    return initData.value.image;
  }
}

export const linkedInAdapter = new LinkedInAdapter();
