import { Router } from "express";
import type { Platform } from "@prisma/client";
import { authenticate, type AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import * as accountsService from "../services/accounts.service.js";
import { env } from "../config/env.js";

const router = Router();

const VALID_PLATFORMS = new Set<string>([
  "LINKEDIN",
  "FACEBOOK",
  "INSTAGRAM",
  "TWITTER",
  "REDDIT",
]);

function parsePlatform(value: string): Platform {
  const upper = value.toUpperCase();

  if (!VALID_PLATFORMS.has(upper)) {
    throw new AppError(400, `Invalid platform: ${value}`);
  }

  return upper as Platform;
}

function oauthSuccessUrl(platform: string, accountName?: string): string {
  const params = new URLSearchParams({ connected: platform.toLowerCase() });
  if (accountName) params.set("account", accountName);
  return `${env.FRONTEND_URL}/accounts?${params.toString()}`;
}

function oauthErrorUrl(message: string): string {
  return `${env.FRONTEND_URL}/accounts?oauth_error=${encodeURIComponent(message)}`;
}

// OAuth success page (frontend nahi hone par)
router.get("/oauth/success", (req, res) => {
  const platform = String(req.query.platform ?? "platform");

  res.status(200).send(`<!DOCTYPE html>
<html><head><title>SMC — Connected</title>
<style>body{font-family:system-ui;max-width:480px;margin:80px auto;text-align:center}
.ok{color:#16a34a;font-size:48px}h1{color:#111}</style></head>
<body><div class="ok">✅</div>
<h1>${platform.toUpperCase()} Connected!</h1>
<p>Account successfully linked to Social Media Crossposter.</p>
<p><a href="${env.API_BASE_URL}/api/v1/accounts">View connected accounts (API)</a></p>
</body></html>`);
});

// OAuth error page
router.get("/oauth/error", (req, res) => {
  const message = String(req.query.message ?? "Unknown error");

  res.status(400).send(`<!DOCTYPE html>
<html><head><title>SMC — Connection Failed</title>
<style>body{font-family:system-ui;max-width:480px;margin:80px auto;text-align:center}
.err{color:#dc2626;font-size:48px}h1{color:#111}code{background:#f3f4f6;padding:8px;border-radius:6px;display:block;margin-top:16px}</style></head>
<body><div class="err">❌</div>
<h1>Connection Failed</h1>
<code>${message}</code>
<p>Check LinkedIn app settings and try again.</p>
</body></html>`);
});

// Reddit setup status check
router.get("/reddit/status", (_req, res) => {
  const configured = Boolean(
    env.REDDIT_CLIENT_ID && env.REDDIT_CLIENT_SECRET && env.REDDIT_REDIRECT_URI,
  );

  res.json({
    success: true,
    data: {
      configured,
      redirectUri: env.REDDIT_REDIRECT_URI,
      userAgent: env.REDDIT_USER_AGENT ?? "(not set — required for API calls)",
      connectHint: configured
        ? "GET /api/v1/accounts/reddit/connect?token=YOUR_JWT"
        : "Add REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_REDIRECT_URI to .env",
      docs: "See docs/REDDIT_SETUP.md",
    },
  });
});

// LinkedIn setup status check
router.get("/linkedin/status", (_req, res) => {
  const configured = Boolean(
    env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET && env.LINKEDIN_REDIRECT_URI,
  );

  res.json({
    success: true,
    data: {
      configured,
      redirectUri: env.LINKEDIN_REDIRECT_URI,
      connectHint: configured
        ? "GET /api/v1/accounts/linkedin/connect?token=YOUR_JWT"
        : "Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to .env",
    },
  });
});

// List platform connection status (configured / implemented)
router.get("/platforms", authenticate, (_req, res) => {
  const platforms = accountsService.listPlatformStatuses();

  res.json({ success: true, data: { platforms } });
});

// List connected accounts
router.get("/", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const accounts = await accountsService.listAccounts(req.userId);

  res.json({ success: true, data: { accounts } });
});

// Get connect URL as JSON (Postman / frontend)
router.get("/:platform/connect-url", authenticate, (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const platform = parsePlatform(String(req.params.platform));
  const authUrl = accountsService.getConnectUrl(platform, req.userId);

  res.json({
    success: true,
    data: {
      authUrl,
      browserUrl:
        env.NODE_ENV === "development"
          ? `${env.API_BASE_URL}/api/v1/accounts/${platform.toLowerCase()}/connect?token=${req.headers.authorization?.slice(7) ?? ""}`
          : undefined,
    },
  });
});

// Start OAuth — redirects to platform
router.get("/:platform/connect", authenticate, (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const platform = parsePlatform(String(req.params.platform));
  const authUrl = accountsService.getConnectUrl(platform, req.userId);

  res.redirect(authUrl);
});

// OAuth callback — platform redirects here
router.get("/:platform/callback", async (req, res) => {
  const platform = parsePlatform(String(req.params.platform));
  const code = String(req.query.code ?? "");
  const state = String(req.query.state ?? "");
  const error = req.query.error;

  if (error) {
    res.redirect(oauthErrorUrl(String(error)));
    return;
  }

  if (!code || !state) {
    res.redirect(oauthErrorUrl("missing_code_or_state"));
    return;
  }

  try {
    const account = await accountsService.handleOAuthCallback(platform, code, state);
    res.redirect(oauthSuccessUrl(platform, account.accountName ?? account.accountId));
  } catch (err) {
    const message = err instanceof Error ? err.message : "oauth_failed";
    res.redirect(oauthErrorUrl(message));
  }
});

// Disconnect account
router.delete("/:id", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  await accountsService.disconnectAccount(req.userId, String(req.params.id));

  res.json({ success: true, message: "Account disconnected" });
});

// Refresh token manually
router.post("/:id/refresh", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const account = await accountsService.refreshAccountToken(req.userId, String(req.params.id));

  res.json({ success: true, data: { account } });
});

export default router;
