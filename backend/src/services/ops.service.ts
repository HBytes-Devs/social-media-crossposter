import type {
  PostStatus,
  SupportIssueStatus,
  SubscriptionStatus,
  SubscriptionTier,
  UserRole,
} from "@prisma/client";
import { prisma } from "../config/database.js";
import { PLANS } from "../config/plans.js";
import { AppError } from "../middleware/error.middleware.js";
import { recordActivity } from "./ops-telemetry.service.js";
import { subscriptionFromUser } from "./plan.service.js";

const PAID_ACTIVE: SubscriptionStatus[] = ["ACTIVE", "TRIALING"];

function startOfDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

function isPaidActive(tier: SubscriptionTier, status: SubscriptionStatus): boolean {
  return (tier === "MEDIUM" || tier === "PREMIUM") && PAID_ACTIVE.includes(status);
}

function estimateUserMrr(user: {
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  organization: {
    subscriptionTier: SubscriptionTier;
    subscriptionStatus: SubscriptionStatus;
  } | null;
}): { tier: SubscriptionTier; mrr: number; source: "individual" | "organization" | "none" } {
  const org = user.organization;
  if (org && isPaidActive(org.subscriptionTier, org.subscriptionStatus)) {
    return {
      tier: org.subscriptionTier,
      mrr: PLANS[org.subscriptionTier].priceUsd,
      source: "organization",
    };
  }
  if (isPaidActive(user.subscriptionTier, user.subscriptionStatus)) {
    return {
      tier: user.subscriptionTier,
      mrr: PLANS[user.subscriptionTier].priceUsd,
      source: "individual",
    };
  }
  return { tier: "FREE", mrr: 0, source: "none" };
}

export async function getOverview() {
  const today = startOfDay();
  const dayAgo = hoursAgo(24);

  const [
    usersTotal,
    admins,
    superAdmins,
    postsToday,
    openIssues,
    errors24h,
    users,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "SUPER_ADMIN" } }),
    prisma.post.count({ where: { createdAt: { gte: today } } }),
    prisma.supportIssue.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.systemErrorLog.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.user.findMany({
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        organization: {
          select: { subscriptionTier: true, subscriptionStatus: true },
        },
      },
    }),
  ]);

  let estimatedMrr = 0;
  let paidUsers = 0;
  const byTier = { FREE: 0, MEDIUM: 0, PREMIUM: 0 };

  for (const u of users) {
    const est = estimateUserMrr(u);
    byTier[est.tier] += 1;
    if (est.mrr > 0) {
      estimatedMrr += est.mrr;
      paidUsers += 1;
    }
  }

  return {
    usersTotal,
    admins,
    superAdmins,
    paidUsers,
    estimatedMrr,
    postsToday,
    openIssues,
    errors24h,
    tierDistribution: byTier,
  };
}

export async function listOpsUsers(query?: string) {
  const today = startOfDay();
  const users = await prisma.user.findMany({
    where: query?.trim()
      ? {
          OR: [
            { email: { contains: query.trim(), mode: "insensitive" } },
            { name: { contains: query.trim(), mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          subscriptionTier: true,
          subscriptionStatus: true,
        },
      },
      accounts: {
        where: { isActive: true },
        select: {
          id: true,
          platform: true,
          accountName: true,
          accountId: true,
          isActive: true,
        },
        orderBy: { platform: "asc" },
      },
      _count: { select: { posts: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const userIds = users.map((u) => u.id);
  const [postsToday, lastActivity] = await Promise.all([
    prisma.post.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds }, createdAt: { gte: today } },
      _count: { _all: true },
    }),
    prisma.userActivityEvent.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds } },
      _max: { createdAt: true },
    }),
  ]);

  const postsTodayMap = new Map(postsToday.map((r) => [r.userId, r._count._all]));
  const lastActiveMap = new Map(
    lastActivity.map((r) => [r.userId, r._max.createdAt?.toISOString() ?? null]),
  );

  return users.map((user) => {
    const est = estimateUserMrr(user);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isSuspended: user.isSuspended,
      organizationId: user.organizationId,
      organization: user.organization
        ? {
            id: user.organization.id,
            name: user.organization.name,
            tier: user.organization.subscriptionTier,
            status: user.organization.subscriptionStatus,
          }
        : null,
      subscription: subscriptionFromUser({
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        currentPeriodEnd: user.currentPeriodEnd,
        organization: user.organization,
      }),
      individualTier: user.subscriptionTier,
      individualStatus: user.subscriptionStatus,
      estimatedMrr: est.mrr,
      postsTotal: user._count.posts,
      postsToday: postsTodayMap.get(user.id) ?? 0,
      lastActiveAt: lastActiveMap.get(user.id) ?? null,
      connectedAccounts: user.accounts.map((a) => ({
        id: a.id,
        platform: a.platform,
        accountName: a.accountName,
        accountId: a.accountId,
        isActive: a.isActive,
      })),
      createdAt: user.createdAt.toISOString(),
    };
  });
}

export async function updateOpsUser(
  actorId: string,
  actorRole: UserRole,
  userId: string,
  input: {
    role?: UserRole;
    subscriptionTier?: SubscriptionTier;
    subscriptionStatus?: SubscriptionStatus;
    organizationId?: string | null;
    isSuspended?: boolean;
  },
) {
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new AppError(404, "User not found");

  if (input.role !== undefined) {
    if (actorRole !== "SUPER_ADMIN") {
      throw new AppError(403, "Only Super Admin can change roles");
    }
    if (target.role === "SUPER_ADMIN" && input.role !== "SUPER_ADMIN") {
      const superCount = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
      if (superCount <= 1) {
        throw new AppError(400, "Cannot demote the last Super Admin");
      }
    }
  }

  if (input.isSuspended === true && target.role === "SUPER_ADMIN") {
    const superCount = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
    if (superCount <= 1) {
      throw new AppError(400, "Cannot suspend the last Super Admin");
    }
  }

  if (input.isSuspended === true && userId === actorId) {
    throw new AppError(400, "Cannot suspend your own account");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.subscriptionTier !== undefined
        ? { subscriptionTier: input.subscriptionTier }
        : {}),
      ...(input.subscriptionStatus !== undefined
        ? { subscriptionStatus: input.subscriptionStatus }
        : {}),
      ...(input.organizationId !== undefined
        ? { organizationId: input.organizationId }
        : {}),
      ...(input.isSuspended !== undefined ? { isSuspended: input.isSuspended } : {}),
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          subscriptionTier: true,
          subscriptionStatus: true,
        },
      },
      accounts: {
        where: { isActive: true },
        select: {
          id: true,
          platform: true,
          accountName: true,
          accountId: true,
          isActive: true,
        },
        orderBy: { platform: "asc" },
      },
      _count: { select: { posts: true } },
    },
  });

  await recordActivity({
    userId: actorId,
    action: "ADMIN_ACTION",
    path: `/ops/users/${userId}`,
    meta: { changes: input },
  });

  const est = estimateUserMrr(updated);
  return {
    id: updated.id,
    email: updated.email,
    name: updated.name,
    role: updated.role,
    isSuspended: updated.isSuspended,
    organizationId: updated.organizationId,
    organization: updated.organization
      ? {
          id: updated.organization.id,
          name: updated.organization.name,
          tier: updated.organization.subscriptionTier,
          status: updated.organization.subscriptionStatus,
        }
      : null,
    subscription: subscriptionFromUser({
      email: updated.email,
      name: updated.name,
      subscriptionTier: updated.subscriptionTier,
      subscriptionStatus: updated.subscriptionStatus,
      currentPeriodEnd: updated.currentPeriodEnd,
      organization: updated.organization,
    }),
    individualTier: updated.subscriptionTier,
    individualStatus: updated.subscriptionStatus,
    estimatedMrr: est.mrr,
    postsTotal: updated._count.posts,
    postsToday: 0,
    lastActiveAt: null,
    connectedAccounts: updated.accounts.map((a) => ({
      id: a.id,
      platform: a.platform,
      accountName: a.accountName,
      accountId: a.accountId,
      isActive: a.isActive,
    })),
    createdAt: updated.createdAt.toISOString(),
  };
}

export async function getSubscriptions() {
  const [users, orgs] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        organization: {
          select: {
            id: true,
            name: true,
            subscriptionTier: true,
            subscriptionStatus: true,
          },
        },
      },
    }),
    prisma.organization.findMany({
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const individualByTier: Record<string, number> = {};
  const individualByStatus: Record<string, number> = {};
  const effectiveByTier: Record<string, number> = { FREE: 0, MEDIUM: 0, PREMIUM: 0 };

  for (const u of users) {
    individualByTier[u.subscriptionTier] = (individualByTier[u.subscriptionTier] ?? 0) + 1;
    individualByStatus[u.subscriptionStatus] =
      (individualByStatus[u.subscriptionStatus] ?? 0) + 1;
    const est = estimateUserMrr(u);
    effectiveByTier[est.tier] += 1;
  }

  return {
    individualByTier,
    individualByStatus,
    effectiveByTier,
    organizations: orgs.map((org) => ({
      id: org.id,
      name: org.name,
      subscriptionTier: org.subscriptionTier,
      subscriptionStatus: org.subscriptionStatus,
      seatLimit: org.seatLimit,
      seatUsed: org._count.members,
      createdAt: org.createdAt.toISOString(),
    })),
  };
}

export async function getEarnings() {
  const users = await prisma.user.findMany({
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          subscriptionTier: true,
          subscriptionStatus: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const paid: Array<{
    id: string;
    email: string;
    name: string | null;
    tier: SubscriptionTier;
    source: string;
    mrr: number;
    updatedAt: string;
  }> = [];

  let estimatedMrr = 0;
  const dayAgo = hoursAgo(24);
  let newPaid24h = 0;

  for (const u of users) {
    const est = estimateUserMrr(u);
    if (est.mrr <= 0) continue;
    estimatedMrr += est.mrr;
    paid.push({
      id: u.id,
      email: u.email,
      name: u.name,
      tier: est.tier,
      source: est.source,
      mrr: est.mrr,
      updatedAt: u.updatedAt.toISOString(),
    });
    if (u.updatedAt >= dayAgo && isPaidActive(u.subscriptionTier, u.subscriptionStatus)) {
      newPaid24h += 1;
    }
  }

  return {
    estimatedMrr,
    paidCount: paid.length,
    newPaid24h,
    currency: "USD",
    note: "Estimated MRR from active MEDIUM/PREMIUM plans (Stripe payouts not included).",
    paidAccounts: paid,
  };
}

export async function getUsage(opts: {
  userId?: string;
  from?: string;
  to?: string;
}) {
  const to = opts.to ? new Date(opts.to) : new Date();
  const from = opts.from ? new Date(opts.from) : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);

  const where = {
    createdAt: { gte: from, lte: to },
    ...(opts.userId ? { userId: opts.userId } : {}),
  };

  const events = await prisma.userActivityEvent.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 2000,
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });

  const dailyCounts: Record<string, number> = {};
  const hourlyBuckets = Array.from({ length: 24 }, () => 0);
  const perUser: Record<
    string,
    { userId: string; email: string; name: string | null; count: number }
  > = {};

  for (const e of events) {
    const day = e.createdAt.toISOString().slice(0, 10);
    dailyCounts[day] = (dailyCounts[day] ?? 0) + 1;
    hourlyBuckets[e.createdAt.getUTCHours()] += 1;
    const existing = perUser[e.userId];
    if (existing) {
      existing.count += 1;
    } else {
      perUser[e.userId] = {
        userId: e.user.id,
        email: e.user.email,
        name: e.user.name,
        count: 1,
      };
    }
  }

  return {
    from: from.toISOString(),
    to: to.toISOString(),
    dailyCounts,
    hourlyBuckets,
    perUser: Object.values(perUser).sort((a, b) => b.count - a.count),
    events: events.slice(0, 200).map((e) => ({
      id: e.id,
      userId: e.userId,
      email: e.user.email,
      name: e.user.name,
      action: e.action,
      path: e.path,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}

export async function listOpsPosts(opts: {
  userId?: string;
  status?: PostStatus;
  q?: string;
  limit?: number;
}) {
  const limit = Math.min(opts.limit ?? 100, 300);
  const posts = await prisma.post.findMany({
    where: {
      ...(opts.userId ? { userId: opts.userId } : {}),
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.q?.trim()
        ? {
            OR: [
              { content: { contains: opts.q.trim(), mode: "insensitive" } },
              { user: { email: { contains: opts.q.trim(), mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
      targets: { select: { platform: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return posts.map((p) => ({
    id: p.id,
    userId: p.userId,
    userEmail: p.user.email,
    userName: p.user.name,
    status: p.status,
    contentPreview: p.content.slice(0, 180),
    language: p.language,
    platforms: p.targets.map((t) => t.platform),
    createdAt: p.createdAt.toISOString(),
    publishedAt: p.publishedAt?.toISOString() ?? null,
    scheduledAt: p.scheduledFor?.toISOString() ?? null,
  }));
}

export async function listErrors(limit = 100) {
  const rows = await prisma.systemErrorLog.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 500),
    include: { user: { select: { id: true, email: true } } },
  });

  return rows.map((r) => ({
    id: r.id,
    level: r.level,
    message: r.message,
    stack: r.stack,
    path: r.path,
    userId: r.userId,
    userEmail: r.user?.email ?? null,
    meta: r.meta,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function listIssues(status?: SupportIssueStatus) {
  const rows = await prisma.supportIssue.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { id: true, email: true, name: true } },
      createdBy: { select: { id: true, email: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    status: r.status,
    priority: r.priority,
    source: r.source,
    userId: r.userId,
    userEmail: r.user?.email ?? null,
    userName: r.user?.name ?? null,
    createdById: r.createdById,
    createdByEmail: r.createdBy?.email ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function createIssue(
  actorId: string,
  input: { title: string; body: string; priority?: string; userId?: string },
) {
  const row = await prisma.supportIssue.create({
    data: {
      title: input.title.trim().slice(0, 200),
      body: input.body.trim().slice(0, 5000),
      priority: input.priority ?? "medium",
      source: "MANUAL",
      userId: input.userId,
      createdById: actorId,
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
      createdBy: { select: { id: true, email: true } },
    },
  });

  return {
    id: row.id,
    title: row.title,
    body: row.body,
    status: row.status,
    priority: row.priority,
    source: row.source,
    userId: row.userId,
    userEmail: row.user?.email ?? null,
    userName: row.user?.name ?? null,
    createdById: row.createdById,
    createdByEmail: row.createdBy?.email ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateIssue(
  issueId: string,
  input: { status?: SupportIssueStatus; priority?: string; title?: string; body?: string },
) {
  const existing = await prisma.supportIssue.findUnique({ where: { id: issueId } });
  if (!existing) throw new AppError(404, "Issue not found");

  const row = await prisma.supportIssue.update({
    where: { id: issueId },
    data: {
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.title !== undefined ? { title: input.title.trim().slice(0, 200) } : {}),
      ...(input.body !== undefined ? { body: input.body.trim().slice(0, 5000) } : {}),
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
      createdBy: { select: { id: true, email: true } },
    },
  });

  return {
    id: row.id,
    title: row.title,
    body: row.body,
    status: row.status,
    priority: row.priority,
    source: row.source,
    userId: row.userId,
    userEmail: row.user?.email ?? null,
    userName: row.user?.name ?? null,
    createdById: row.createdById,
    createdByEmail: row.createdBy?.email ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
