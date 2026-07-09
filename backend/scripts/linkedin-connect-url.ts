/**
 * Print LinkedIn connect URL — run: npx tsx scripts/linkedin-connect-url.ts
 */
import "dotenv/config";
import * as authService from "../src/services/auth.service.js";
import { env } from "../src/config/env.js";

const EMAIL = "haseebcodejourney@gmail.com";
const PASSWORD = "SMC@Hamza2026!";

async function main() {
  console.log("\n=== LinkedIn Connect Helper ===\n");

  const configured = Boolean(env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET);
  console.log("LinkedIn configured:", configured ? "✅ YES" : "❌ NO — add credentials to .env");

  if (!configured) {
    console.log("\nSee docs/LINKEDIN_SETUP.md for setup steps.\n");
    process.exit(1);
  }

  const { token } = await authService.login({ email: EMAIL, password: PASSWORD });
  const browserUrl = `${env.API_BASE_URL}/api/v1/accounts/linkedin/connect?token=${token}`;

  console.log("\n📋 Open this URL in your browser:\n");
  console.log(browserUrl);
  console.log("\nAfter allowing on LinkedIn, you'll see a success page.\n");
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
