import { Router } from "express";
import { prisma } from "../config/database.js";
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

  const health: HealthStatus = {
    status: database === "connected" ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    environment: process.env.NODE_ENV ?? "development",
    database,
    version: "1.0.0",
  };

  // 200 even when DB is down — useful during local setup without PostgreSQL
  res.status(200).json({
    success: true,
    data: health,
  });
});

export default router;
