import type { Request, Response } from "express";
import * as billingService from "../services/billing.service.js";
import { AppError } from "../middleware/error.middleware.js";

export async function stripeWebhookHandler(req: Request, res: Response): Promise<void> {
  const signature = req.headers["stripe-signature"];

  if (!signature || typeof signature !== "string") {
    throw new AppError(400, "Missing Stripe signature");
  }

  const payload = req.body as Buffer;
  await billingService.handleStripeWebhook(payload, signature);

  res.json({ received: true });
}
