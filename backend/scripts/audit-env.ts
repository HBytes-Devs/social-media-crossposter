import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { HeadBucketCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "../src/config/database.js";
import { env } from "../src/config/env.js";
import { isS3Configured, s3Client } from "../src/config/s3.js";
import { isPlatformConfigured } from "../src/platforms/platform.config.js";
import { isRecaptchaConfigured } from "../src/services/recaptcha.service.js";
import { isEmailConfigured } from "../src/services/email.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ENV = path.resolve(__dirname, "../../frontend/.env");
const FRONTEND_ENV_EXAMPLE = path.resolve(__dirname, "../../frontend/.env.example");

function mask(value: string | undefined, show = 4): string {
  if (!value?.trim()) return "MISSING";
  const v = value.trim();
  if (v.length <= show * 2) return `${v.slice(0, 2)}…`;
  return `${v.slice(0, show)}…${v.slice(-show)}`;
}

function status(present: boolean): string {
  return present ? "SET" : "MISSING";
}

async function testDatabase(): Promise<string> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "OK";
  } catch (e) {
    return `FAIL — ${e instanceof Error ? e.message : e}`;
  }
}

async function testS3(): Promise<string> {
  if (!isS3Configured()) return "NOT_CONFIGURED";
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: env.AWS_S3_BUCKET! }));
    const key = `smc/health-check-${Date.now()}.txt`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET!,
        Key: key,
        Body: "smc-env-audit",
        ContentType: "text/plain",
      }),
    );
    await s3Client.send(
      new DeleteObjectCommand({ Bucket: env.AWS_S3_BUCKET!, Key: key }),
    );
    return "OK (bucket + upload/delete)";
  } catch (e) {
    return `FAIL — ${e instanceof Error ? e.message : e}`;
  }
}

function readFrontendSiteKey(): string | undefined {
  if (!fs.existsSync(FRONTEND_ENV)) return undefined;
  const content = fs.readFileSync(FRONTEND_ENV, "utf8");
  const match = content.match(/^VITE_RECAPTCHA_SITE_KEY=(.+)$/m);
  return match?.[1]?.trim();
}

async function main() {
  console.log("\n=== SMC Environment Audit ===\n");

  const frontendSiteKey = readFrontendSiteKey();
  const frontendEnvExists = fs.existsSync(FRONTEND_ENV);

  const rows: Array<[string, string, string]> = [
    ["Server", "PORT", env.PORT.toString()],
    ["Server", "API_BASE_URL", env.API_BASE_URL],
    ["Server", "FRONTEND_URL", env.FRONTEND_URL],
    ["Database", "DATABASE_URL", mask(env.DATABASE_URL, 8)],
    ["Auth", "JWT_SECRET", status(Boolean(env.JWT_SECRET))],
    ["Auth", "TOKEN_ENCRYPTION_KEY", status(Boolean(env.TOKEN_ENCRYPTION_KEY))],
    ["LinkedIn", "CLIENT_ID", mask(env.LINKEDIN_CLIENT_ID)],
    ["LinkedIn", "CLIENT_SECRET", mask(env.LINKEDIN_CLIENT_SECRET)],
    ["LinkedIn", "REDIRECT_URI", env.LINKEDIN_REDIRECT_URI ?? "MISSING"],
    ["LinkedIn", "API_VERSION", env.LINKEDIN_API_VERSION],
    ["AWS", "ACCESS_KEY_ID", mask(env.AWS_ACCESS_KEY_ID)],
    ["AWS", "SECRET_ACCESS_KEY", mask(env.AWS_SECRET_ACCESS_KEY)],
    ["AWS", "REGION", env.AWS_REGION],
    ["AWS", "S3_BUCKET", env.AWS_S3_BUCKET ?? "MISSING"],
    ["AWS", "S3_PUBLIC_URL", env.AWS_S3_PUBLIC_URL ?? "MISSING"],
    ["reCAPTCHA", "SECRET_KEY (backend)", mask(env.RECAPTCHA_SECRET_KEY)],
    [
      "reCAPTCHA",
      "SITE_KEY (frontend .env)",
      frontendSiteKey ? mask(frontendSiteKey) : frontendEnvExists ? "MISSING in .env" : "frontend/.env NOT FOUND",
    ],
    ["Email", "SMTP", isEmailConfigured() ? `OK (${env.SMTP_HOST})` : "NOT_CONFIGURED"],
    ["AI", "MINIMAX_API_KEY", mask(env.MINIMAX_API_KEY)],
    ["AI", "OPENAI_API_KEY", mask(env.OPENAI_API_KEY)],
    ["Billing", "STRIPE_SECRET_KEY", mask(env.STRIPE_SECRET_KEY)],
    ["Billing", "STRIPE_PRICE_MEDIUM", mask(env.STRIPE_PRICE_MEDIUM, 6)],
    ["Premier", "MEMBER_EMAILS", env.PREMIER_MEMBER_EMAILS ?? "MISSING"],
    ["Meta", "APP_ID", status(Boolean(env.META_APP_ID))],
    ["Twitter", "CLIENT_ID", status(Boolean(env.TWITTER_CLIENT_ID))],
    ["Reddit", "CLIENT_ID", status(Boolean(env.REDDIT_CLIENT_ID))],
  ];

  for (const [group, key, value] of rows) {
    console.log(`${group.padEnd(10)} ${key.padEnd(28)} ${value}`);
  }

  console.log("\n--- Live checks ---\n");
  console.log("Database:        ", await testDatabase());
  console.log("LinkedIn app:    ", isPlatformConfigured("LINKEDIN") ? "CONFIGURED" : "NOT_CONFIGURED");
  console.log("S3:              ", await testS3());
  console.log("reCAPTCHA backend:", isRecaptchaConfigured() ? "ENABLED" : "DISABLED");

  const recaptchaPairOk =
    isRecaptchaConfigured() && Boolean(frontendSiteKey?.trim());
  console.log(
    "reCAPTCHA pair:  ",
    !isRecaptchaConfigured()
      ? "N/A (backend disabled)"
      : recaptchaPairOk
        ? "OK (secret + site key)"
        : "MISMATCH — backend secret set but frontend VITE_RECAPTCHA_SITE_KEY missing",
  );

  if (!frontendEnvExists) {
    console.log(
      "\nTip: Copy frontend/.env.example → frontend/.env and set VITE_RECAPTCHA_SITE_KEY (pair with backend secret).",
    );
  }

  console.log("");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
