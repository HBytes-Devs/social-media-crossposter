import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { AppError } from "../middleware/error.middleware.js";
import type { RegisterInput, LoginInput } from "../validators/auth.validator.js";
import type { AuthUser, AuthResponse } from "../types/index.js";

const SALT_ROUNDS = 12;

function sanitizeUser(user: {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: Date;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
  };
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

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      password: hashedPassword,
      name: input.name ?? null,
    },
  });

  const token = generateToken(user.id);

  return {
    user: sanitizeUser(user),
    token,
  };
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isValid = await bcrypt.compare(input.password, user.password);

  if (!isValid) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = generateToken(user.id);

  return {
    user: sanitizeUser(user),
    token,
  };
}

export async function getProfile(userId: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return sanitizeUser(user);
}
