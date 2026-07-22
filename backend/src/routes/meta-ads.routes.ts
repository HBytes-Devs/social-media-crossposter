import { Router } from "express";
import { authenticate, type AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import { env } from "../config/env.js";
import * as metaAdsService from "../services/meta-ads.service.js";
import * as planService from "../services/plan.service.js";
import type { MetaAdsDatePreset } from "../integrations/meta-ads/meta-ads.types.js";

const router = Router();

function oauthSuccessUrl(): string {
  return `${env.FRONTEND_URL}/meta-ads?connected=true`;
}

function oauthErrorUrl(message: string): string {
  return `${env.FRONTEND_URL}/meta-ads?oauth_error=${encodeURIComponent(message)}`;
}

async function assertAnalyticsAccess(userId: string): Promise<void> {
  const billing = await planService.getBillingStatus(userId);
  if (!billing.subscription.plan.limits.analytics) {
    throw new AppError(403, "Meta Ads analytics requires Medium or Premium plan");
  }
}

router.get("/status", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");
  const data = await metaAdsService.getMetaAdsStatusForUser(req.userId);
  res.json({ success: true, data });
});

router.get("/connect-url", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");
  await assertAnalyticsAccess(req.userId);
  const authUrl = metaAdsService.getConnectUrl(req.userId);
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
    const result = await metaAdsService.handleOAuthCallback(code, state);
    if (result.status === "needs_ad_account") {
      return res.redirect(`${env.FRONTEND_URL}/meta-ads?needs_ad_account=true`);
    }
    return res.redirect(oauthSuccessUrl());
  } catch (err) {
    const message = err instanceof Error ? err.message : "Meta Ads connection failed";
    return res.redirect(oauthErrorUrl(message));
  }
});

router.post("/link-account", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");
  await assertAnalyticsAccess(req.userId);

  const body = (req.body ?? {}) as { adAccountId?: string };
  if (!body.adAccountId?.trim()) {
    throw new AppError(400, "adAccountId is required");
  }

  const account = await metaAdsService.linkAdAccount(req.userId, body.adAccountId);
  res.json({ success: true, data: account });
});

router.get("/accounts", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");
  await assertAnalyticsAccess(req.userId);
  const accounts = await metaAdsService.listAccounts(req.userId);
  res.json({ success: true, data: { accounts } });
});

router.delete("/accounts/:id", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");
  await assertAnalyticsAccess(req.userId);
  await metaAdsService.disconnectAccount(req.userId, String(req.params.id));
  res.json({ success: true, message: "Meta Ads account disconnected" });
});

router.get("/analytics", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");
  await assertAnalyticsAccess(req.userId);

  const data = await metaAdsService.getAnalyticsSummary(req.userId, {
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
    preset?: MetaAdsDatePreset;
    from?: string;
    to?: string;
    accountId?: string;
  };

  const data = await metaAdsService.syncMetrics(req.userId, body);
  res.json({ success: true, data });
});

export default router;
