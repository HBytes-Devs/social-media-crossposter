/**
 * Print Facebook connect URL — run: npx tsx scripts/facebook-connect-url.ts
 */
import "dotenv/config";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { env } from "../src/config/env.js";
import { isPlatformConfigured } from "../src/platforms/platform.config.js";

const EMAIL = process.env.SMC_TEST_EMAIL ?? "haseebcodejourney@gmail.com";
const prisma = new PrismaClient();

async function main() {
  console.log("\n=== Facebook Connect Helper ===\n");

  const configured = isPlatformConfigured("FACEBOOK");
  console.log("Facebook configured:", configured ? "YES" : "NO");

  if (!configured) {
    console.log("\nAdd META_APP_ID, META_APP_SECRET, META_REDIRECT_URI to backend/.env\n");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) {
    console.error(`No user found for ${EMAIL}`);
    process.exit(1);
  }

  const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
  const browserUrl = `${env.API_BASE_URL}/api/v1/accounts/facebook/connect?token=${token}`;

  console.log(`User: ${EMAIL}`);
  console.log("\n1) Make sure backend is running: npm run dev");
  console.log("2) Open this URL in your browser:\n");
  console.log(browserUrl);
  console.log("\n3) Approve Facebook permissions and select your Page.");
  console.log("4) Refresh Compose — Facebook should show Connected.\n");
}

main()
  .catch((e) => {
    console.error("Error:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
