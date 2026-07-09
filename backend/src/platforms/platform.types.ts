import type { Platform } from "@prisma/client";

export type TokenResult = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes: string[];
  accountId: string;
  accountName?: string;
  metadata?: Record<string, unknown>;
};

export type UnifiedPost = {
  content: string;
  title?: string;
  images: string[];
  customContent?: string;
};

export type PublishResult = {
  success: boolean;
  platformPostId?: string;
  error?: string;
};

export type PlatformLimits = {
  maxTextLength: number;
  maxImages: number;
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export interface PlatformAdapter {
  platform: Platform;
  getAuthUrl(state: string, options?: { codeChallenge?: string }): string;
  handleCallback(code: string, oauthExtras?: Record<string, unknown>): Promise<TokenResult>;
  refreshToken(accessToken: string, refreshToken?: string): Promise<TokenResult>;
  publishPost(
    post: UnifiedPost,
    accessToken: string,
    accountId: string,
    metadata?: Record<string, unknown>,
  ): Promise<PublishResult>;
  validateContent(post: UnifiedPost): ValidationResult;
  getLimits(): PlatformLimits;
}
