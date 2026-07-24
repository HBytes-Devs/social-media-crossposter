import type {
  Platform,
  SubscriptionStatus,
  SubscriptionTier,
  UserRole,
} from "@prisma/client";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { getPlan, isPlatformAllowedForTier, PLANS } from "../config/plans.js";
import { AppError } from "../middleware/error.middleware.js";

export type OrganizationSummary = {
  id: string;
  name: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  seatLimit: number;
  seatUsed: number;
};

export type SubscriptionPublic = {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  plan: ReturnType<typeof getPlan>;
  premierMember?: boolean;
  source?: "individual" | "organization" | "premier";
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
const superAdminEmails = () => parseCsvSet(env.SUPER_ADMIN_EMAILS);

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

export function isSuperAdminEmail(email: string): boolean {
  return superAdminEmails().has(email.trim().toLowerCase());
}

export async function syncSuperAdminRole(userId: string, email: string): Promise<UserRole> {
  if (!isSuperAdminEmail(email)) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user?.role ?? "USER";
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role: "SUPER_ADMIN" },
    select: { role: true },
  });
  return updated.role;
}

export function hasActivePaidAccess(
  tier: SubscriptionTier,
  status: SubscriptionStatus,
): boolean {
  if (tier === "FREE") return true;
  return status === "ACTIVE" || status === "TRIALING";
}

type OrgFields = {
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
} | null;

function resolveEffectiveTier(
  user: UserSubscriptionFields & {
    email?: string;
    name?: string | null;
    organization?: OrgFields;
  },
): { tier: SubscriptionTier; source: SubscriptionPublic["source"]; status: SubscriptionStatus } {
  if (user.email && isPremierMember({ email: user.email, name: user.name })) {
    return {
      tier: "PREMIUM",
      source: "premier",
      status: user.subscriptionStatus,
    };
  }

  const org = user.organization;
  if (org && hasActivePaidAccess(org.subscriptionTier, org.subscriptionStatus) && org.subscriptionTier !== "FREE") {
    return {
      tier: org.subscriptionTier,
      source: "organization",
      status: org.subscriptionStatus,
    };
  }

  if (org && org.subscriptionTier === "FREE" && hasActivePaidAccess(org.subscriptionTier, org.subscriptionStatus)) {
    // Org on FREE still counts as org source when member has no better individual paid plan
    const individualPaid = hasActivePaidAccess(user.subscriptionTier, user.subscriptionStatus)
      && user.subscriptionTier !== "FREE";
    if (!individualPaid) {
      return {
        tier: "FREE",
        source: "organization",
        status: org.subscriptionStatus,
      };
    }
  }

  const tier = hasActivePaidAccess(user.subscriptionTier, user.subscriptionStatus)
    ? user.subscriptionTier
    : "FREE";

  return {
    tier,
    source: "individual",
    status: user.subscriptionStatus,
  };
}

export type UsagePublic = {
  accountsConnected: number;
  postsThisMonth: number;
};

export type BillingStatusPublic = {
  subscription: SubscriptionPublic;
  usage: UsagePublic;
  billingConfigured: boolean;
  organization: OrganizationSummary | null;
};

function startOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function getOrganizationSummary(
  organizationId: string,
): Promise<OrganizationSummary | null> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { _count: { select: { members: true } } },
  });
  if (!org) return null;
  return {
    id: org.id,
    name: org.name,
    tier: org.subscriptionTier,
    status: org.subscriptionStatus,
    seatLimit: org.seatLimit,
    seatUsed: org._count.members,
  };
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
      organizationId: true,
      organization: {
        select: {
          id: true,
          name: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          seatLimit: true,
          _count: { select: { members: true } },
        },
      },
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

  const resolved = resolveEffectiveTier(user);
  const premier = isPremierMember(user);

  const organization: OrganizationSummary | null = user.organization
    ? {
        id: user.organization.id,
        name: user.organization.name,
        tier: user.organization.subscriptionTier,
        status: user.organization.subscriptionStatus,
        seatLimit: user.organization.seatLimit,
        seatUsed: user.organization._count.members,
      }
    : null;

  return {
    subscription: {
      tier: resolved.tier,
      status: resolved.status,
      currentPeriodEnd: user.currentPeriodEnd?.toISOString() ?? null,
      plan: getPlan(resolved.tier),
      premierMember: premier,
      source: resolved.source,
    },
    usage: {
      accountsConnected,
      postsThisMonth,
    },
    billingConfigured: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
    organization,
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
  organization?: OrgFields;
};

export function subscriptionFromUser(user: UserSubscriptionFields): SubscriptionPublic {
  const resolved = resolveEffectiveTier(user);
  const premier = user.email ? isPremierMember({ email: user.email, name: user.name }) : false;

  return {
    tier: resolved.tier,
    status: resolved.status,
    currentPeriodEnd: user.currentPeriodEnd?.toISOString() ?? null,
    plan: getPlan(resolved.tier),
    premierMember: premier,
    source: resolved.source,
  };
}

export async function assertOrgHasSeat(organizationId: string): Promise<void> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { _count: { select: { members: true } } },
  });
  if (!org) {
    throw new AppError(404, "Organization not found");
  }
  if (org._count.members >= org.seatLimit) {
    throw new AppError(403, `Organization seat limit reached (${org.seatLimit}).`);
  }
}
