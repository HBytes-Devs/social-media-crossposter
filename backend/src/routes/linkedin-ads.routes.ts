import { Router } from "express";
import { authenticate, type AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import { env } from "../config/env.js";
import * as linkedInAdsService from "../services/linkedin-ads.service.js";
import * as planService from "../services/plan.service.js";
import type { LinkedInAdsDatePreset } from "../integrations/linkedin-ads/linkedin-ads.types.js";

const router = Router();

function oauthSuccessUrl(): string {
  return `${env.FRONTEND_URL}/linkedin-ads?connected=true`;
}

function oauthErrorUrl(message: string): string {
  return `${env.FRONTEND_URL}/linkedin-ads?oauth_error=${encodeURIComponent(message)}`;
}

async function assertAnalyticsAccess(userId: string): Promise<void> {
  const billing = await planService.getBillingStatus(userId);
  if (!billing.subscription.plan.limits.analytics) {
    throw new AppError(403, "LinkedIn Ads analytics requires Medium or Premium plan");
  }
}

router.get("/status", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");
  const data = await linkedInAdsService.getLinkedInAdsStatusForUser(req.userId);
  res.json({ success: true, data });
});

router.get("/connect-url", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");
  await assertAnalyticsAccess(req.userId);
  const authUrl = linkedInAdsService.getConnectUrl(req.userId);
  res.json({ success: true, data: { authUrl } });
});

router.get("/callback", async (req, res) => {
  const code = String(req.query.code ?? "");
  const state = String(req.query.state ?? "");
  const error = req.query.error ? String(req.query.error) : null;

  if (error) {
    return res.redirect(oauthErrorUrl(error));
  }

  if (!code || !state) {
    return res.redirect(oauthErrorUrl("Missing OAuth code or state"));
  }

  try {
    await linkedInAdsService.handleOAuthCallback(code, state);
    return res.redirect(oauthSuccessUrl());
  } catch (err) {
    const message = err instanceof Error ? err.message : "LinkedIn Ads connection failed";
    return res.redirect(oauthErrorUrl(message));
  }
});

router.get("/accounts", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");
  await assertAnalyticsAccess(req.userId);
  const accounts = await linkedInAdsService.listAccounts(req.userId);
  res.json({ success: true, data: { accounts } });
});

router.delete("/accounts/:id", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");
  await assertAnalyticsAccess(req.userId);
  await linkedInAdsService.disconnectAccount(req.userId, String(req.params.id));
  res.json({ success: true, message: "LinkedIn Ads account disconnected" });
});

router.get("/analytics", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");
  await assertAnalyticsAccess(req.userId);

  const data = await linkedInAdsService.getAnalyticsSummary(req.userId, {
    preset: req.query.preset ? String(req.query.preset) : undefined,
    from: req.query.from ? String(req.query.from) : undefined,
    to: req.query.to ? String(req.query.to) : undefined,
    accountId: req.query.accountId ? String(req.query.accountId) : undefined,
    sync: req.query.sync === "true",
  });

  res.json({ success: true, data });
});

router.post("/sync", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");
  await assertAnalyticsAccess(req.userId);

  const body = (req.body ?? {}) as {
    preset?: LinkedInAdsDatePreset;
    from?: string;
    to?: string;
    accountId?: string;
  };

  const data = await linkedInAdsService.syncMetrics(req.userId, body);
  res.json({ success: true, data });
});

export default router;
