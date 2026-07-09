import type { Platform } from "@prisma/client";
import { facebookAdapter } from "./facebook/facebook.adapter.js";
import { instagramAdapter } from "./instagram/instagram.adapter.js";
import { linkedInAdapter } from "./linkedin/linkedin.adapter.js";
import { redditAdapter } from "./reddit/reddit.adapter.js";
import { twitterAdapter } from "./twitter/twitter.adapter.js";
import type { PlatformAdapter } from "./platform.types.js";
import { AppError } from "../middleware/error.middleware.js";

const adapters: Record<Platform, PlatformAdapter> = {
  LINKEDIN: linkedInAdapter,
  FACEBOOK: facebookAdapter,
  INSTAGRAM: instagramAdapter,
  TWITTER: twitterAdapter,
  REDDIT: redditAdapter,
};

export function getPlatformAdapter(platform: Platform): PlatformAdapter {
  const adapter = adapters[platform];

  if (!adapter) {
    throw new AppError(501, `Platform ${platform} is not implemented yet`);
  }

  return adapter;
}

export function isPlatformSupported(platform: Platform): boolean {
  return platform in adapters;
}

export function getSupportedPlatforms(): Platform[] {
  return Object.keys(adapters) as Platform[];
}
