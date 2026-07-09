/**
 * Print Reddit connect URL — run: npx tsx scripts/reddit-connect-url.ts
 */
import "dotenv/config";
import * as authService from "../src/services/auth.service.js";
import { env } from "../src/config/env.js";

const EMAIL = "haseebcodejourney@gmail.com";
const PASSWORD = "SMC@Hamza2026!";

async function main() {
  console.log("\n=== Reddit Connect Helper ===\n");

  const configured = Boolean(
    env.REDDIT_CLIENT_ID && env.REDDIT_CLIENT_SECRET && env.REDDIT_REDIRECT_URI,
  );
  console.log("Reddit configured:", configured ? "✅ YES" : "❌ NO — add credentials to .env");

  if (!configured) {
    console.log("\nSee docs/REDDIT_SETUP.md for setup steps.\n");
    process.exit(1);
  }

  console.log("Redirect URI:", env.REDDIT_REDIRECT_URI);
  console.log("User-Agent:", env.REDDIT_USER_AGENT ?? "(not set — add REDDIT_USER_AGENT to .env)");

  const { token } = await authService.login({ email: EMAIL, password: PASSWORD });
  const browserUrl = `${env.API_BASE_URL}/api/v1/accounts/reddit/connect?token=${token}`;

  console.log("\n📋 Open this URL in your browser:\n");
  console.log(browserUrl);
  console.log("\nAfter allowing on Reddit, refresh Accounts page in SMC.\n");
}

main().catch((e) => {
  console.error("Error:", e instanceof Error ? e.message : e);
  process.exit(1);
});
