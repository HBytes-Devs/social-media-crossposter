import type { Prisma, SupportIssueSource, UserActivityAction } from "@prisma/client";
import { prisma } from "../config/database.js";
import { logger } from "../utils/logger.js";

export async function recordActivity(input: {
  userId: string;
  action: UserActivityAction;
  path?: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.userActivityEvent.create({
      data: {
        userId: input.userId,
        action: input.action,
        path: input.path,
        meta: (input.meta as Prisma.InputJsonValue | undefined) ?? undefined,
      },
    });
  } catch (err) {
    logger.warn("Failed to record activity", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function recordSystemError(input: {
  level?: string;
  message: string;
  stack?: string;
  path?: string;
  userId?: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.systemErrorLog.create({
      data: {
        level: input.level ?? "error",
        message: input.message.slice(0, 2000),
        stack: input.stack?.slice(0, 8000),
        path: input.path,
        userId: input.userId,
        meta: (input.meta as Prisma.InputJsonValue | undefined) ?? undefined,
      },
    });
  } catch (err) {
    logger.warn("Failed to persist system error", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function createSupportIssue(input: {
  title: string;
  body: string;
  priority?: string;
  source?: SupportIssueSource;
  userId?: string;
  createdById?: string;
}): Promise<void> {
  try {
    await prisma.supportIssue.create({
      data: {
        title: input.title.slice(0, 200),
        body: input.body.slice(0, 5000),
        priority: input.priority ?? "medium",
        source: input.source ?? "MANUAL",
        userId: input.userId,
        createdById: input.createdById,
      },
    });
  } catch (err) {
    logger.warn("Failed to create support issue", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
