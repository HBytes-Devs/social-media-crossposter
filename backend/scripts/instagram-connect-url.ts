/**
 * Print Instagram connect URL — run: npx tsx scripts/instagram-connect-url.ts
 */
import "dotenv/config";
import * as authService from "../src/services/auth.service.js";
import { env } from "../src/config/env.js";
import { getInstagramRedirectUri } from "../src/platforms/platform.config.js";

const EMAIL = "haseebcodejourney@gmail.com";
const PASSWORD = "SMC@Hamza2026!";

async function main() {
  console.log("\n=== Instagram Connect Helper ===\n");

  const configured = Boolean(env.META_APP_ID && env.META_APP_SECRET);
  console.log("Meta configured:", configured ? "✅ YES" : "❌ NO — add META_APP_ID, META_APP_SECRET to .env");
  console.log("Instagram redirect URI:", getInstagramRedirectUri());

  if (!configured) {
    console.log("\nSee docs/INSTAGRAM_SETUP.md for setup steps.\n");
    process.exit(1);
  }

  const { token } = await authService.login({ email: EMAIL, password: PASSWORD });
  const browserUrl = `${env.API_BASE_URL}/api/v1/accounts/instagram/connect?token=${token}`;

  console.log("\n📋 Open this URL in your browser:\n");
  console.log(browserUrl);
  console.log("\nRequirements:");
  console.log("  • Instagram Business or Creator account");
  console.log("  • Facebook Page linked to your IG account");
  console.log("  • Your Facebook user must be App Admin/Developer in Meta dashboard");
  console.log("\nAfter allowing permissions, you'll see a success page.\n");
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
