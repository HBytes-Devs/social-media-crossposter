import { randomBytes } from "crypto";
import type { SubscriptionStatus, SubscriptionTier, UserRole } from "@prisma/client";
import { prisma } from "../config/database.js";
import { AppError } from "../middleware/error.middleware.js";
import { assertOrgHasSeat, subscriptionFromUser } from "./plan.service.js";

const INVITE_DAYS = 14;

function publicUser(user: {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  organizationId: string | null;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  organization: {
    id: string;
    name: string;
    subscriptionTier: SubscriptionTier;
    subscriptionStatus: SubscriptionStatus;
  } | null;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
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
    createdAt: user.createdAt.toISOString(),
  };
}

export async function listUsers(query?: string) {
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
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return users.map(publicUser);
}

export async function updateUser(
  actorRole: UserRole,
  userId: string,
  input: {
    role?: UserRole;
    subscriptionTier?: SubscriptionTier;
    subscriptionStatus?: SubscriptionStatus;
    organizationId?: string | null;
  },
) {
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    throw new AppError(404, "User not found");
  }

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

  if (input.organizationId) {
    await assertOrgHasSeat(input.organizationId);
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
    },
  });

  return publicUser(updated);
}

export async function listOrganizations() {
  const orgs = await prisma.organization.findMany({
    include: { _count: { select: { members: true, invites: true } } },
    orderBy: { createdAt: "desc" },
  });

  return orgs.map((org) => ({
    id: org.id,
    name: org.name,
    subscriptionTier: org.subscriptionTier,
    subscriptionStatus: org.subscriptionStatus,
    seatLimit: org.seatLimit,
    seatUsed: org._count.members,
    pendingInvites: org._count.invites,
    createdAt: org.createdAt.toISOString(),
  }));
}

export async function createOrganization(input: {
  name: string;
  subscriptionTier?: SubscriptionTier;
  subscriptionStatus?: SubscriptionStatus;
  seatLimit?: number;
}) {
  const org = await prisma.organization.create({
    data: {
      name: input.name.trim(),
      subscriptionTier: input.subscriptionTier ?? "FREE",
      subscriptionStatus: input.subscriptionStatus ?? "ACTIVE",
      seatLimit: input.seatLimit ?? 5,
    },
  });

  return {
    id: org.id,
    name: org.name,
    subscriptionTier: org.subscriptionTier,
    subscriptionStatus: org.subscriptionStatus,
    seatLimit: org.seatLimit,
    seatUsed: 0,
    pendingInvites: 0,
    createdAt: org.createdAt.toISOString(),
  };
}

export async function updateOrganization(
  orgId: string,
  input: {
    name?: string;
    subscriptionTier?: SubscriptionTier;
    subscriptionStatus?: SubscriptionStatus;
    seatLimit?: number;
  },
) {
  const existing = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { _count: { select: { members: true } } },
  });
  if (!existing) {
    throw new AppError(404, "Organization not found");
  }

  if (input.seatLimit !== undefined && input.seatLimit < existing._count.members) {
    throw new AppError(
      400,
      `Seat limit cannot be below current members (${existing._count.members})`,
    );
  }

  const org = await prisma.organization.update({
    where: { id: orgId },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.subscriptionTier !== undefined
        ? { subscriptionTier: input.subscriptionTier }
        : {}),
      ...(input.subscriptionStatus !== undefined
        ? { subscriptionStatus: input.subscriptionStatus }
        : {}),
      ...(input.seatLimit !== undefined ? { seatLimit: input.seatLimit } : {}),
    },
    include: { _count: { select: { members: true, invites: true } } },
  });

  return {
    id: org.id,
    name: org.name,
    subscriptionTier: org.subscriptionTier,
    subscriptionStatus: org.subscriptionStatus,
    seatLimit: org.seatLimit,
    seatUsed: org._count.members,
    pendingInvites: org._count.invites,
    createdAt: org.createdAt.toISOString(),
  };
}

export async function createInvite(orgId: string, email: string) {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) {
    throw new AppError(404, "Organization not found");
  }

  await assertOrgHasSeat(orgId);

  const normalized = email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalized } });
  if (existingUser?.organizationId === orgId) {
    throw new AppError(400, "User is already a member of this organization");
  }

  const invite = await prisma.organizationInvite.create({
    data: {
      organizationId: orgId,
      email: normalized,
      token: randomBytes(24).toString("hex"),
      expiresAt: new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  return {
    id: invite.id,
    email: invite.email,
    token: invite.token,
    expiresAt: invite.expiresAt.toISOString(),
    organizationId: invite.organizationId,
  };
}

export async function acceptInvite(userId: string, token: string) {
  const invite = await prisma.organizationInvite.findUnique({
    where: { token },
  });

  if (!invite || invite.acceptedAt || invite.expiresAt.getTime() < Date.now()) {
    throw new AppError(400, "Invalid or expired invite");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
    throw new AppError(403, "Invite email does not match your account");
  }

  await assertOrgHasSeat(invite.organizationId);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { organizationId: invite.organizationId },
    }),
    prisma.organizationInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    }),
  ]);

  return { organizationId: invite.organizationId };
}
