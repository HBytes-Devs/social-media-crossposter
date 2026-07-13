import type { Platform, SubscriptionStatus, SubscriptionTier } from "@prisma/client";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { getPlan, isPlatformAllowedForTier, PLANS } from "../config/plans.js";
import { AppError } from "../middleware/error.middleware.js";

export type SubscriptionPublic = {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  plan: ReturnType<typeof getPlan>;
  premierMember?: boolean;
};

function parseCsvSet(value: string | undefined): Set<string> {
  if (!value?.trim()) return new Set();
  return new Set(
    value
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
}

const premierEmails = () => parseCsvSet(env.PREMIER_MEMBER_EMAILS);
const premierHandles = () => parseCsvSet(env.PREMIER_MEMBER_HANDLES);

export function isPremierMember(user: {
  email: string;
  name?: string | null;
}): boolean {
  const emails = premierEmails();
  const handles = premierHandles();
  const email = user.email.trim().toLowerCase();

  if (emails.has(email)) return true;

  const name = user.name?.trim().toLowerCase();
  if (name && handles.has(name)) return true;

  const localPart = email.split("@")[0];
  if (localPart && handles.has(localPart)) return true;

  return false;
}

function resolveEffectiveTier(
  user: UserSubscriptionFields & { email?: string; name?: string | null },
): SubscriptionTier {
  if (user.email && isPremierMember({ email: user.email, name: user.name })) {
    return "PREMIUM";
  }

  return hasActivePaidAccess(user.subscriptionTier, user.subscriptionStatus)
    ? user.subscriptionTier
    : "FREE";
}

export type UsagePublic = {
  accountsConnected: number;
  postsThisMonth: number;
};

export type BillingStatusPublic = {
  subscription: SubscriptionPublic;
  usage: UsagePublic;
  billingConfigured: boolean;
};

function startOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function hasActivePaidAccess(
  tier: SubscriptionTier,
  status: SubscriptionStatus,
): boolean {
  if (tier === "FREE") return true;
  return status === "ACTIVE" || status === "TRIALING";
}

export async function getBillingStatus(userId: string): Promise<BillingStatusPublic> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      name: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const [accountsConnected, postsThisMonth] = await Promise.all([
    prisma.socialAccount.count({ where: { userId, isActive: true } }),
    prisma.post.count({
      where: {
        userId,
        deletedAt: null,
        createdAt: { gte: startOfMonth() },
      },
    }),
  ]);

  const effectiveTier = resolveEffectiveTier(user);
  const premier = isPremierMember(user);

  return {
    subscription: {
      tier: effectiveTier,
      status: user.subscriptionStatus,
      currentPeriodEnd: user.currentPeriodEnd?.toISOString() ?? null,
      plan: getPlan(effectiveTier),
      premierMember: premier,
    },
    usage: {
      accountsConnected,
      postsThisMonth,
    },
    billingConfigured: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
  };
}

export async function assertCanConnectPlatform(userId: string, platform: Platform): Promise<void> {
  const status = await getBillingStatus(userId);
  const { tier, plan } = status.subscription;

  if (!isPlatformAllowedForTier(tier, platform)) {
    throw new AppError(
      403,
      `${platform} is not available on the ${plan.name} plan. Upgrade to connect more platforms.`,
    );
  }

  const maxAccounts = plan.limits.maxAccounts;
  if (status.usage.accountsConnected >= maxAccounts) {
    throw new AppError(
      403,
      `Account limit reached (${maxAccounts} on ${plan.name}). Upgrade your plan to connect more accounts.`,
    );
  }
}

export async function assertCanConnectExistingAccount(
  userId: string,
  platform: Platform,
  accountId: string,
): Promise<void> {
  const existing = await prisma.socialAccount.findUnique({
    where: {
      userId_platform_accountId: { userId, platform, accountId },
    },
  });

  if (existing) return;

  await assertCanConnectPlatform(userId, platform);
}

export async function assertCanCreatePost(userId: string): Promise<void> {
  const status = await getBillingStatus(userId);
  const { plan } = status.subscription;
  const maxPosts = plan.limits.maxPostsPerMonth;

  if (status.usage.postsThisMonth >= maxPosts) {
    throw new AppError(
      403,
      `Monthly post limit reached (${maxPosts} on ${plan.name}). Upgrade to post more.`,
    );
  }
}

export async function assertCanSchedule(userId: string, scheduledFor: Date): Promise<void> {
  const status = await getBillingStatus(userId);
  const maxDays = status.subscription.plan.limits.maxScheduleDaysAhead;

  if (maxDays === null) return;

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxDays);

  if (scheduledFor.getTime() > maxDate.getTime()) {
    throw new AppError(
      403,
      `Basic plan allows scheduling up to ${maxDays} days ahead. Upgrade to Medium or Premium for unlimited scheduling.`,
    );
  }
}

export async function assertHasAnalytics(userId: string): Promise<void> {
  const status = await getBillingStatus(userId);
  if (!status.subscription.plan.limits.analytics) {
    throw new AppError(403, "Analytics requires Medium or Premium plan.");
  }
}

export async function assertHasAiAssist(userId: string): Promise<void> {
  const status = await getBillingStatus(userId);
  if (!status.subscription.plan.limits.aiAssist) {
    throw new AppError(403, "AI Assist requires Medium or Premium plan.");
  }
}

export function listPublicPlans() {
  return Object.values(PLANS).map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    priceUsd: plan.priceUsd,
    priceLabel: plan.priceLabel,
    interval: plan.interval,
    features: plan.features,
    limits: {
      maxAccounts: plan.limits.maxAccounts === Number.MAX_SAFE_INTEGER ? null : plan.limits.maxAccounts,
      maxPostsPerMonth:
        plan.limits.maxPostsPerMonth === Number.MAX_SAFE_INTEGER
          ? null
          : plan.limits.maxPostsPerMonth,
      maxScheduleDaysAhead: plan.limits.maxScheduleDaysAhead,
      allowedPlatforms:
        plan.limits.allowedPlatforms === "all" ? "all" : plan.limits.allowedPlatforms,
      analytics: plan.limits.analytics,
      aiAssist: plan.limits.aiAssist,
    },
  }));
}

export type UserSubscriptionFields = {
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  email?: string;
  name?: string | null;
};

export function subscriptionFromUser(user: UserSubscriptionFields): SubscriptionPublic {
  const effectiveTier = resolveEffectiveTier(user);
  const premier = user.email ? isPremierMember({ email: user.email, name: user.name }) : false;

  return {
    tier: effectiveTier,
    status: user.subscriptionStatus,
    currentPeriodEnd: user.currentPeriodEnd?.toISOString() ?? null,
    plan: getPlan(effectiveTier),
    premierMember: premier,
  };
}
