import { Router } from "express";
import { z } from "zod";
import { authenticate, type AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import * as billingService from "../services/billing.service.js";
import * as planService from "../services/plan.service.js";

const router = Router();

const checkoutSchema = z.object({
  tier: z.enum(["MEDIUM", "PREMIUM"]),
});

router.get("/plans", (_req, res) => {
  res.json({
    success: true,
    data: {
      plans: planService.listPublicPlans(),
      billingConfigured: billingService.isStripeConfigured(),
    },
  });
});

router.get("/status", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) {
    throw new AppError(401, "Authentication required");
  }

  const status = await planService.getBillingStatus(req.userId);

  res.json({
    success: true,
    data: status,
  });
});

router.post("/checkout", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) {
    throw new AppError(401, "Authentication required");
  }

  const { tier } = checkoutSchema.parse(req.body);
  const session = await billingService.createCheckoutSession(req.userId, tier);

  res.json({
    success: true,
    data: session,
  });
});

router.post("/portal", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) {
    throw new AppError(401, "Authentication required");
  }

  const session = await billingService.createPortalSession(req.userId);

  res.json({
    success: true,
    data: session,
  });
});

export default router;
