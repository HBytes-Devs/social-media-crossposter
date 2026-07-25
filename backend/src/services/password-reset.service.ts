import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { prisma } from "../config/database.js";
import { AppError } from "../middleware/error.middleware.js";
import { logger } from "../utils/logger.js";
import { sendPasswordResetCode } from "./email.service.js";
import type { ForgotPasswordInput, ResetPasswordInput } from "../validators/auth.validator.js";

const CODE_EXPIRY_MINUTES = 15;
const RESEND_COOLDOWN_SECONDS = 60;
const SALT_ROUNDS = 12;

function generateCode(): string {
  return String(randomInt(100000, 1000000));
}

export async function requestPasswordReset(input: ForgotPasswordInput): Promise<void> {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Always look like success when the account does not exist (do not leak emails).
  if (!user) {
    return;
  }

  const recentCode = await prisma.passwordResetCode.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (
    recentCode &&
    Date.now() - recentCode.createdAt.getTime() < RESEND_COOLDOWN_SECONDS * 1000
  ) {
    throw new AppError(429, "Please wait a minute before requesting another code");
  }

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, SALT_ROUNDS);

  const created = await prisma.passwordResetCode.create({
    data: {
      userId: user.id,
      codeHash,
      expiresAt: new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000),
    },
  });

  try {
    await sendPasswordResetCode(user.email, code);
  } catch (err) {
    await prisma.passwordResetCode.delete({ where: { id: created.id } }).catch(() => undefined);

    logger.error("Password reset email failed", {
      email: user.email,
      error: err instanceof Error ? err.message : String(err),
    });

    throw new AppError(
      503,
      "Unable to send reset email right now. Please try again later or contact support.",
    );
  }
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(400, "Invalid or expired reset code");
  }

  const resetCode = await prisma.passwordResetCode.findFirst({
    where: {
      userId: user.id,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!resetCode) {
    throw new AppError(400, "Invalid or expired reset code");
  }

  const codeValid = await bcrypt.compare(input.code, resetCode.codeHash);

  if (!codeValid) {
    throw new AppError(400, "Invalid or expired reset code");
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetCode.update({
      where: { id: resetCode.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetCode.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
        id: { not: resetCode.id },
      },
      data: { usedAt: new Date() },
    }),
  ]);
}
