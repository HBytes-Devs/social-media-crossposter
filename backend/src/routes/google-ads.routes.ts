import { Router } from "express";
import { authenticate, type AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import { env } from "../config/env.js";
import * as googleAdsService from "../services/google-ads.service.js";
import * as planService from "../services/plan.service.js";

const router = Router();

function oauthSuccessUrl(): string {
  return `${env.FRONTEND_URL}/google-ads?connected=true`;
}

function oauthErrorUrl(message: string): string {
  return `${env.FRONTEND_URL}/google-ads?oauth_error=${encodeURIComponent(message)}`;
}

async function assertAnalyticsAccess(userId: string): Promise<void> {
  const billing = await planService.getBillingStatus(userId);
  if (!billing.subscription.plan.limits.analytics) {
    throw new AppError(403, "Google Ads analytics requires Medium or Premium plan");
  }
}

router.get("/status", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const data = await googleAdsService.getGoogleAdsStatusForUser(req.userId);
  res.json({ success: true, data });
});

router.get("/connect-url", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");
  await assertAnalyticsAccess(req.userId);

  const authUrl = googleAdsService.getConnectUrl(req.userId);
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
    await googleAdsService.handleOAuthCallback(code, state);
    return res.redirect(oauthSuccessUrl());
  } catch (err) {
    const message = err instanceof Error ? err.message : "Google Ads connection failed";
    return res.redirect(oauthErrorUrl(message));
  }
});

router.get("/accounts", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");
  await assertAnalyticsAccess(req.userId);

  const accounts = await googleAdsService.listAccounts(req.userId);
  res.json({ success: true, data: { accounts } });
});

router.delete("/accounts/:id", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");
  await assertAnalyticsAccess(req.userId);

  await googleAdsService.disconnectAccount(req.userId, String(req.params.id));
  res.json({ success: true, message: "Google Ads account disconnected" });
});

router.get("/analytics", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");
  await assertAnalyticsAccess(req.userId);

  const preset = req.query.preset ? String(req.query.preset) : undefined;
  const from = req.query.from ? String(req.query.from) : undefined;
  const to = req.query.to ? String(req.query.to) : undefined;
  const accountId = req.query.accountId ? String(req.query.accountId) : undefined;
  const sync = req.query.sync === "true";

  const data = await googleAdsService.getAnalyticsSummary(req.userId, {
    preset,
    from,
    to,
    accountId,
    sync,
  });

  res.json({ success: true, data });
});

router.post("/sync", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");
  await assertAnalyticsAccess(req.userId);

  const body = (req.body ?? {}) as {
    preset?: string;
    from?: string;
    to?: string;
    accountId?: string;
  };

  const data = await googleAdsService.syncMetrics(req.userId, {
    preset: body.preset as import("../integrations/google-ads/google-ads.types.js").GoogleAdsDatePreset | undefined,
    from: body.from,
    to: body.to,
    accountId: body.accountId,
  });

  res.json({ success: true, data });
});

export default router;
