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
import googleAdsRoutes from "./google-ads.routes.js";
import linkedInAdsRoutes from "./linkedin-ads.routes.js";
import metaAdsRoutes from "./meta-ads.routes.js";
import adminRoutes from "./admin.routes.js";
import opsRoutes from "./ops.routes.js";
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
router.use("/google-ads", googleAdsRoutes);
router.use("/linkedin-ads", linkedInAdsRoutes);
router.use("/meta-ads", metaAdsRoutes);
router.use("/admin", adminRoutes);
router.use("/ops", opsRoutes);

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
