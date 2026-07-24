import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./auth.middleware.js";
import { recordActivity } from "../services/ops-telemetry.service.js";

const SKIP_PREFIXES = ["/health", "/auth/config", "/version", "/billing/webhook"];

/** Lightweight activity sampler for authenticated API traffic */
export function activityTracker(req: AuthRequest, _res: Response, next: NextFunction): void {
  next();

  if (!req.userId) return;
  if (req.method === "OPTIONS") return;

  const path = req.originalUrl.split("?")[0] ?? req.path;
  if (SKIP_PREFIXES.some((p) => path.includes(p))) return;
  // Avoid flooding: only write mutating or key GET dashboards
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
