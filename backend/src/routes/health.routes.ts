import { Router } from "express";
import { prisma } from "../config/database.js";
import { getProductVersion } from "../lib/product-version.js";
import type { HealthStatus } from "../types/index.js";

const router = Router();
const startTime = Date.now();

router.get("/", async (_req, res) => {
  let database: HealthStatus["database"] = "disconnected";

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "connected";
  } catch {
    database = "disconnected";
  }

  const product = getProductVersion();

  const health: HealthStatus & { sentry: string } = {
    status: database === "connected" ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    environment: process.env.NODE_ENV ?? "development",
    database,
    version: product.version,
    channel: product.channel,
    fullVersion: product.fullVersion,
    apiVersion: product.apiVersion,
    product: product.product,
    sentry: process.env.SENTRY_DSN ? "enabled" : "disabled",
  };

  // 503 in production when DB is down — load balancers treat as unhealthy.
  // 200 in development — useful during local setup without PostgreSQL.
  const httpStatus =
    database === "connected" ? 200 : process.env.NODE_ENV === "production" ? 503 : 200;

  res.status(httpStatus).json({
    success: database === "connected",
    data: health,
  });
});

export default router;
