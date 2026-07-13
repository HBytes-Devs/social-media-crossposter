import { Router } from "express";
import { authenticate, type AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import * as dashboardService from "../services/dashboard.service.js";
import * as planService from "../services/plan.service.js";

const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const wantsAnalytics = req.query.analytics === "true";
  let includeAnalytics = false;

  if (wantsAnalytics) {
    const billing = await planService.getBillingStatus(req.userId);
    includeAnalytics = billing.subscription.plan.limits.analytics;
  }

  const data = await dashboardService.getDashboard(req.userId, {
    includeAnalytics,
  });
  res.json({ success: true, data });
});

export default router;
