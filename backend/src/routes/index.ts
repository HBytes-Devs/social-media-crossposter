import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import mediaRoutes from "./media.routes.js";
import accountsRoutes from "./accounts.routes.js";
import postsRoutes from "./posts.routes.js";
import aiRoutes from "./ai.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import settingsRoutes from "./settings.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/media", mediaRoutes);
router.use("/accounts", accountsRoutes);
router.use("/posts", postsRoutes);
router.use("/ai", aiRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/settings", settingsRoutes);

router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Social Media Crossposter API",
    version: "1.0.0",
    docs: "/api/v1/health",
  });
});

export default router;
