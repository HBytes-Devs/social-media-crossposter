import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import mediaRoutes from "./media.routes.js";
import accountsRoutes from "./accounts.routes.js";
import postsRoutes from "./posts.routes.js";
import aiRoutes from "./ai.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import settingsRoutes from "./settings.routes.js";
import billingRoutes from "./billing.routes.js";
import versionRoutes from "./version.routes.js";
import metaRoutes from "./meta.routes.js";
import { getProductVersion } from "../lib/product-version.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/media", mediaRoutes);
router.use("/accounts", accountsRoutes);
router.use("/posts", postsRoutes);
router.use("/ai", aiRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/settings", settingsRoutes);
router.use("/billing", billingRoutes);
router.use("/version", versionRoutes);
router.use("/meta", metaRoutes);

router.get("/", (_req, res) => {
  const product = getProductVersion();
  res.json({
    success: true,
    message: product.product,
    version: product.fullVersion,
    channel: product.channel,
    apiVersion: product.apiVersion,
    docs: "/api/v1/health",
  });
});

export default router;
