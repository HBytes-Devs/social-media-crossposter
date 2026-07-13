import type { Platform, SubscriptionTier } from "@prisma/client";

export type PlanDefinition = {
  id: SubscriptionTier;
  name: string;
  description: string;
  priceUsd: number;
  priceLabel: string;
  interval: "month" | "free";
  features: string[];
  limits: {
    maxAccounts: number;
    maxPostsPerMonth: number;
    maxScheduleDaysAhead: number | null;
    allowedPlatforms: Platform[] | "all";
    analytics: boolean;
    aiAssist: boolean;
  };
};

export const PLANS: Record<SubscriptionTier, PlanDefinition> = {
  FREE: {
    id: "FREE",
    name: "Basic",
    description: "Shuruat ke liye — LinkedIn par post karo",
    priceUsd: 0,
    priceLabel: "Free",
    interval: "free",
    features: [
      "2 connected accounts",
      "10 posts per month",
      "LinkedIn only",
      "Schedule up to 7 days ahead",
      "Basic compose + preview",
    ],
    limits: {
      maxAccounts: 2,
      maxPostsPerMonth: 10,
      maxScheduleDaysAhead: 7,
      allowedPlatforms: ["LINKEDIN"],
      analytics: false,
      aiAssist: false,
    },
  },
  MEDIUM: {
    id: "MEDIUM",
    name: "Medium",
    description: "Regular posters ke liye — zyada platforms aur scheduling",
    priceUsd: 9,
    priceLabel: "$9/mo",
    interval: "month",
    features: [
      "5 connected accounts",
      "100 posts per month",
      "LinkedIn + Reddit",
      "Unlimited scheduling",
      "Dashboard analytics",
      "AI Assist (BYOK keys)",
    ],
    limits: {
      maxAccounts: 5,
      maxPostsPerMonth: 100,
      maxScheduleDaysAhead: null,
      allowedPlatforms: ["LINKEDIN", "REDDIT"],
      analytics: true,
      aiAssist: true,
    },
  },
  PREMIUM: {
    id: "PREMIUM",
    name: "Premium",
    description: "Power users — sab platforms, unlimited posts",
    priceUsd: 19,
    priceLabel: "$19/mo",
    interval: "month",
    features: [
      "Unlimited connected accounts",
      "Unlimited posts",
      "All platforms (LinkedIn, Reddit, Facebook, X, Instagram)",
      "Unlimited scheduling",
      "Full analytics",
      "AI Assist + priority support",
    ],
    limits: {
      maxAccounts: Number.MAX_SAFE_INTEGER,
      maxPostsPerMonth: Number.MAX_SAFE_INTEGER,
      maxScheduleDaysAhead: null,
      allowedPlatforms: "all",
      analytics: true,
      aiAssist: true,
    },
  },
};

export const PAID_TIERS: SubscriptionTier[] = ["MEDIUM", "PREMIUM"];

export function getPlan(tier: SubscriptionTier): PlanDefinition {
  return PLANS[tier];
}

export function tierFromStripePriceId(priceId: string | null | undefined): SubscriptionTier | null {
  if (!priceId) return null;

  const medium = process.env.STRIPE_PRICE_MEDIUM?.trim();
  const premium = process.env.STRIPE_PRICE_PREMIUM?.trim();

  if (medium && priceId === medium) return "MEDIUM";
  if (premium && priceId === premium) return "PREMIUM";
  return null;
}

export function stripePriceIdForTier(tier: SubscriptionTier): string | null {
  if (tier === "MEDIUM") return process.env.STRIPE_PRICE_MEDIUM?.trim() ?? null;
  if (tier === "PREMIUM") return process.env.STRIPE_PRICE_PREMIUM?.trim() ?? null;
  return null;
}

export function isPlatformAllowedForTier(tier: SubscriptionTier, platform: Platform): boolean {
  const { allowedPlatforms } = PLANS[tier].limits;
  if (allowedPlatforms === "all") return true;
  return allowedPlatforms.includes(platform);
}
