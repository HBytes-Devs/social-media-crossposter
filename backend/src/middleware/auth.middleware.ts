import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./error.middleware.js";
import type { JwtPayload } from "../types/index.js";

export interface AuthRequest extends Request {
  userId?: string;
}

function extractToken(req: AuthRequest): string | null {
  const header = req.headers.authorization;

  if (header?.startsWith("Bearer ")) {
    return header.slice(7);
  }

  // Dev only — browser se connect: ?token=JWT
  if (env.NODE_ENV === "development" && req.query.token) {
    return String(req.query.token);
  }

  return null;
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
    next();
  } catch {
    next(new AppError(401, "Invalid or expired token"));
  }
}
