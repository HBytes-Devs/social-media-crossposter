import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { logger } from "./utils/logger.js";
import { startScheduler, stopScheduler } from "./services/scheduler.service.js";

async function main() {
  const dbConnected = await connectDatabase();
  const app = createApp();

  if (dbConnected) {
    startScheduler();
  } else {
    logger.warn("Scheduler not started — database not connected");
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 SMC Backend running on http://localhost:${env.PORT}`);
    logger.info(`📡 API: http://localhost:${env.PORT}/api/v1`);
    logger.info(`❤️  Health: http://localhost:${env.PORT}/api/v1/health`);
    logger.info(`🗄️  Database: ${dbConnected ? "connected" : "not connected"}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down...`);
    stopScheduler();
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((error) => {
  logger.error("Failed to start server", error);
  process.exit(1);
});
