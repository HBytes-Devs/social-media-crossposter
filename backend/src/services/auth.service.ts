import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SubscriptionStatus, SubscriptionTier, UserRole } from "@prisma/client";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { AppError } from "../middleware/error.middleware.js";
import type { RegisterInput, LoginInput, UpdateProfileInput } from "../validators/auth.validator.js";
import type { AuthUser, AuthResponse } from "../types/index.js";
import { verifyRecaptcha } from "./recaptcha.service.js";
import {
  getOrganizationSummary,
  subscriptionFromUser,
  syncSuperAdminRole,
} from "./plan.service.js";
import { recordActivity } from "./ops-telemetry.service.js";

const SALT_ROUNDS = 12;

async function sanitizeUser(user: {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  role: UserRole;
  organizationId: string | null;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  organization?: {
    subscriptionTier: SubscriptionTier;
    subscriptionStatus: SubscriptionStatus;
  } | null;
}): Promise<AuthUser> {
  const organization = user.organizationId
    ? await getOrganizationSummary(user.organizationId)
    : null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
    role: user.role,
    organization,
    subscription: subscriptionFromUser({
      email: user.email,
      name: user.name,
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      currentPeriodEnd: user.currentPeriodEnd,
      organization: user.organization ?? null,
    }),
  };
}

async function loadUserForAuth(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: {
        select: {
          subscriptionTier: true,
          subscriptionStatus: true,
        },
      },
    },
  });
}

function generateToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existing) {
    throw new AppError(409, "Email already registered");
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
  const email = input.email.toLowerCase();

  const created = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: input.name ?? null,
    },
  });

  await syncSuperAdminRole(created.id, email);
  const user = await loadUserForAuth(created.id);
  if (!user) {
    throw new AppError(500, "Failed to load user after register");
  }

  const token = generateToken(user.id);

  return {
    user: await sanitizeUser(user),
    token,
  };
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  await verifyRecaptcha(input.recaptchaToken, "login").catch(() => {
    throw new AppError(400, "reCAPTCHA verification failed");
  });

  const found = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!found) {
    throw new AppError(401, "Invalid email or password");
  }

  if (found.isSuspended) {
    throw new AppError(403, "Account suspended. Contact support.");
  }

  const isValid = await bcrypt.compare(input.password, found.password);

  if (!isValid) {
    throw new AppError(401, "Invalid email or password");
  }

  await syncSuperAdminRole(found.id, found.email);
  const user = await loadUserForAuth(found.id);
  if (!user) {
    throw new AppError(500, "Failed to load user after login");
  }

  await recordActivity({ userId: user.id, action: "LOGIN", path: "/auth/login" });

  const token = generateToken(user.id);

  return {
    user: await sanitizeUser(user),
    token,
  };
}

export async function getProfile(userId: string): Promise<AuthUser> {
  await syncSuperAdminFromId(userId);
  const user = await loadUserForAuth(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return sanitizeUser(user);
}

async function syncSuperAdminFromId(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (user) {
    await syncSuperAdminRole(userId, user.email);
  }
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<AuthUser> {
  await prisma.user.update({
    where: { id: userId },
    data: { name: input.name },
  });

  const user = await loadUserForAuth(userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  return sanitizeUser(user);
}
