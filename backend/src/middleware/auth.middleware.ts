import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { AppError } from "./error.middleware.js";
import type { JwtPayload } from "../types/index.js";
import { recordActivity } from "../services/ops-telemetry.service.js";

export interface AuthRequest extends Request {
  userId?: string;
}

function extractToken(req: AuthRequest): string | null {
  const header = req.headers.authorization;

  if (header?.startsWith("Bearer ")) {
    return header.slice(7);
  }

  if (env.NODE_ENV === "development" && req.query.token) {
    return String(req.query.token);
  }

  return null;
}

function maybeTrack(req: AuthRequest): void {
  if (!req.userId) return;
  const path = (req.originalUrl || req.path).split("?")[0] ?? "";
  if (path.includes("/health") || path.includes("/auth/config")) return;

  const track =
    req.method !== "GET" ||
    path.includes("/dashboard") ||
    path.includes("/billing/status") ||
    path.includes("/posts");

  if (!track) return;

  void recordActivity({
    userId: req.userId,
    action: "API",
    path,
    meta: { method: req.method },
  });
}

export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): void {
  const token = extractToken(req);

  if (!token) {
    next(new AppError(401, "Authentication required"));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.userId = payload.userId;

    void prisma.user
      .findUnique({
        where: { id: payload.userId },
        select: { isSuspended: true },
      })
      .then((user) => {
        if (!user) {
          next(new AppError(401, "Invalid or expired token"));
          return;
        }
        if (user.isSuspended) {
          next(new AppError(403, "Account suspended. Contact support."));
          return;
        }
        maybeTrack(req);
        next();
      })
      .catch(next);
  } catch {
    next(new AppError(401, "Invalid or expired token"));
  }
}
