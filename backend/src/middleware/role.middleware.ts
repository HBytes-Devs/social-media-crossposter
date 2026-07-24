import type { NextFunction, Response } from "express";
import type { UserRole } from "@prisma/client";
import { prisma } from "../config/database.js";
import { AppError } from "./error.middleware.js";
import type { AuthRequest } from "./auth.middleware.js";

export type AdminAuthRequest = AuthRequest & {
  userRole?: UserRole;
};

export function requireRole(...allowed: UserRole[]) {
  return async (req: AdminAuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) {
        next(new AppError(401, "Authentication required"));
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { role: true },
      });

      if (!user) {
        next(new AppError(401, "Authentication required"));
        return;
      }

      if (!allowed.includes(user.role)) {
        next(new AppError(403, "Admin access required"));
        return;
      }

      req.userRole = user.role;
      next();
    } catch (err) {
      next(err);
    }
  };
}
