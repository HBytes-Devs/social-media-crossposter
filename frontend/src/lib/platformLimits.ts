export type PlatformLimit = {
  maxTextLength?: number;
  maxImages?: number;
  requiresTitle?: boolean;
  requiresSubreddit?: boolean;
};

export const PLATFORM_LIMITS: Record<string, PlatformLimit> = {
  LINKEDIN: { maxTextLength: 3000, maxImages: 9 },
  REDDIT: { maxTextLength: 40000, maxImages: 1, requiresTitle: true, requiresSubreddit: true },
  TWITTER: { maxTextLength: 280, maxImages: 4 },
  FACEBOOK: { maxTextLength: 63206, maxImages: 10 },
  INSTAGRAM: { maxTextLength: 2200, maxImages: 10 },
};

export function getSelectedPlatformLimits(platforms: string[]): PlatformLimit[] {
  return platforms.map((p) => PLATFORM_LIMITS[p] ?? {});
}

export function getStrictestTextLimit(platforms: string[]): number | null {
  const limits = platforms
    .map((p) => PLATFORM_LIMITS[p]?.maxTextLength)
    .filter((n): n is number => typeof n === "number");
  return limits.length > 0 ? Math.min(...limits) : null;
}

export function getMaxImagesLimit(platforms: string[]): number | null {
  const limits = platforms
    .map((p) => PLATFORM_LIMITS[p]?.maxImages)
    .filter((n): n is number => typeof n === "number");
  return limits.length > 0 ? Math.min(...limits) : null;
}
