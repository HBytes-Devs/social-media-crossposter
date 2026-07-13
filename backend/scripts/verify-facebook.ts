/**
 * Verify Meta/Facebook app credentials and SMC connection state.
 * Run: npx tsx scripts/verify-facebook.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { env } from "../src/config/env.js";
import { isPlatformConfigured } from "../src/platforms/platform.config.js";
import { facebookAdapter } from "../src/platforms/facebook/facebook.adapter.js";

const EXPECTED_APP_ID = "1277713390913841";
const prisma = new PrismaClient();

function pass(label: string, detail?: string) {
  console.log(`  [OK]   ${label}${detail ? ` — ${detail}` : ""}`);
}

function fail(label: string, detail?: string) {
  console.log(`  [FAIL] ${label}${detail ? ` — ${detail}` : ""}`);
}

function warn(label: string, detail?: string) {
  console.log(`  [WARN] ${label}${detail ? ` — ${detail}` : ""}`);
}

async function verifyMetaCredentials(): Promise<boolean> {
  if (!env.META_APP_ID || !env.META_APP_SECRET) {
    fail("META_APP_ID / META_APP_SECRET missing in .env");
    return false;
  }

  if (env.META_APP_ID !== EXPECTED_APP_ID) {
    warn("META_APP_ID differs from expected", `got ${env.META_APP_ID}`);
  } else {
    pass("META_APP_ID matches", EXPECTED_APP_ID);
  }

  if (env.META_APP_SECRET.length < 8) {
    fail("META_APP_SECRET looks too short or failed to parse from .env");
    return false;
  }
  pass("META_APP_SECRET loaded from .env");

  const url = new URL("https://graph.facebook.com/oauth/access_token");
  url.searchParams.set("client_id", env.META_APP_ID);
  url.searchParams.set("client_secret", env.META_APP_SECRET);
  url.searchParams.set("grant_type", "client_credentials");

  const response = await fetch(url);
  const body = await response.text();

  if (!response.ok) {
    fail("Meta API rejected app credentials", body.slice(0, 200));
    return false;
  }

  try {
    const data = JSON.parse(body) as { access_token?: string };
    if (!data.access_token) {
      fail("Meta API response missing access_token", body.slice(0, 200));
      return false;
    }
    pass("Meta API accepted App ID + App Secret");
    return true;
  } catch {
    fail("Invalid Meta API response", body.slice(0, 200));
    return false;
  }
}

async function main() {
  console.log("\n=== Facebook / Meta Verification ===\n");

  console.log("1) Environment");
  if (env.META_REDIRECT_URI) {
    pass("META_REDIRECT_URI", env.META_REDIRECT_URI);
  } else {
    fail("META_REDIRECT_URI missing");
  }

  const configured = isPlatformConfigured("FACEBOOK");
  if (configured) pass("SMC marks Facebook as configured");
  else fail("SMC Facebook not configured — check .env");

  const authUrl = facebookAdapter.getAuthUrl("verify-state");
  if (authUrl.includes(EXPECTED_APP_ID) && authUrl.includes("pages_manage_posts")) {
    pass("OAuth URL generated with correct App ID and scopes");
    console.log(`         ${authUrl.slice(0, 100)}…`);
  } else {
    fail("OAuth URL generation issue", authUrl);
  }

  console.log("\n2) Meta API (live credential check)");
  const credsOk = await verifyMetaCredentials();

  console.log("\n3) Database connection (OAuth completed?)");
  const rows = await prisma.socialAccount.findMany({
    where: { platform: "FACEBOOK" },
    include: { user: { select: { email: true } } },
    orderBy: { updatedAt: "desc" },
  });

  if (rows.length === 0) {
    warn("No Facebook account in database — OAuth not completed yet");
    console.log("         Go to Accounts → Connect Facebook in the app.");
  } else {
    for (const row of rows) {
      const expired = row.expiresAt ? row.expiresAt.getTime() < Date.now() : false;
      pass(`Connected for ${row.user.email}`, `${row.accountName ?? row.accountId}`);
      if (expired) warn("Token may be expired", row.expiresAt?.toISOString() ?? "");
    }
  }

  console.log("\n4) Meta Developer Console (manual — verify in browser)");
  console.log("  - Facebook Login → Valid OAuth Redirect URI:");
  console.log(`    ${env.META_REDIRECT_URI}`);
  console.log("  - App roles → your Facebook user is Admin or Developer");
  console.log("  - You manage at least one Facebook Page");

  console.log("\n--- Summary ---\n");
  if (credsOk && configured && rows.length > 0) {
    console.log("Facebook: CREDENTIALS OK + CONNECTED in SMC");
  } else if (credsOk && configured) {
    console.log("Facebook: CREDENTIALS OK — connect via Accounts page in SMC");
  } else {
    console.log("Facebook: FIX FAILURES ABOVE before connecting");
  }
  console.log("");
}

main()
  .catch((err) => {
    console.error("ERROR:", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
