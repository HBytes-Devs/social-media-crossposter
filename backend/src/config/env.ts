import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  API_BASE_URL: z.string().url().default("http://localhost:3001"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("24h"),
  TOKEN_ENCRYPTION_KEY: z.string().min(32),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_S3_PUBLIC_URL: z.string().optional(),
  AWS_S3_ROOT_PREFIX: z.string().default("smc"),
  /**
   * Media storage mode:
   * - auto: prefer S3 when configured, fall back to local disk on S3 failure
   * - local: always store/serve media from disk (use when S3 keys are quarantined)
   * - s3: require S3 only
   */
  MEDIA_STORAGE: z.enum(["auto", "local", "s3"]).default("auto"),
  MEDIA_LOCAL_DIR: z.string().default("./data/media"),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_REDIRECT_URI: z.string().optional(),
  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  META_REDIRECT_URI: z.string().optional(),
  META_CONFIG_ID: z.string().optional(),
  META_INSTAGRAM_REDIRECT_URI: z.string().optional(),
  META_ADS_REDIRECT_URI: z.string().optional(),
  /** Optional Login for Business config with ads permissions */
  META_ADS_CONFIG_ID: z.string().optional(),
  /** Prefer this Facebook Page when the user manages multiple (name match, case-insensitive). */
  META_PREFERRED_PAGE_NAME: z.string().optional(),
  /** Prefer this Facebook Page ID when set (wins over name). */
  META_PREFERRED_PAGE_ID: z.string().optional(),
  /** When true and META_CONFIG_ID is unset, request instagram_business_* scopes. */
  META_INSTAGRAM_USE_BUSINESS_SCOPES: z.string().optional(),
  /** Use Instagram Login (instagram.com OAuth) — no Facebook Page link required. */
  META_USE_INSTAGRAM_LOGIN: z.string().optional(),
  /** Instagram product App ID (from Meta Instagram API setup). Defaults to META_APP_ID. */
  META_INSTAGRAM_APP_ID: z.string().optional(),
  /** Instagram product App Secret. Defaults to META_APP_SECRET. */
  META_INSTAGRAM_APP_SECRET: z.string().optional(),
  TWITTER_CLIENT_ID: z.string().optional(),
  TWITTER_CLIENT_SECRET: z.string().optional(),
  TWITTER_REDIRECT_URI: z.string().optional(),
  REDDIT_CLIENT_ID: z.string().optional(),
  REDDIT_CLIENT_SECRET: z.string().optional(),
  REDDIT_REDIRECT_URI: z.string().optional(),
  REDDIT_USER_AGENT: z.string().optional(),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  LINKEDIN_API_VERSION: z.string().default("202601"),
  RECAPTCHA_SECRET_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  MINIMAX_API_KEY: z.string().optional(),
  MINIMAX_BASE_URL: z.string().url().default("https://api.minimax.io/v1"),
  MINIMAX_MODEL: z.string().default("MiniMax-M3"),
  MINIMAX_IMAGE_MODEL: z.string().default("image-01"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_IMAGE_MODEL: z.string().default("dall-e-3"),
  SCHEDULER_POLL_INTERVAL_MS: z.coerce.number().int().min(10_000).default(60_000),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_MEDIUM: z.string().optional(),
  STRIPE_PRICE_PREMIUM: z.string().optional(),
  STRIPE_SUCCESS_URL: z.string().url().optional(),
  STRIPE_CANCEL_URL: z.string().url().optional(),
  GOOGLE_ADS_CLIENT_ID: z.string().optional(),
  GOOGLE_ADS_CLIENT_SECRET: z.string().optional(),
  GOOGLE_ADS_DEVELOPER_TOKEN: z.string().optional(),
  GOOGLE_ADS_REDIRECT_URI: z.string().optional(),
  /** Optional override; falls back to LINKEDIN_CLIENT_ID */
  LINKEDIN_ADS_CLIENT_ID: z.string().optional(),
  /** Optional override; falls back to LINKEDIN_CLIENT_SECRET */
  LINKEDIN_ADS_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_ADS_REDIRECT_URI: z.string().optional(),
  /** Comma-separated emails with complimentary Premium (founders / premier members) */
  PREMIER_MEMBER_EMAILS: z.string().optional(),
  /** Comma-separated handles matched against user name or email local-part */
  PREMIER_MEMBER_HANDLES: z.string().optional(),
  /** Comma-separated emails elevated to SUPER_ADMIN on login/register */
  SUPER_ADMIN_EMAILS: z.string().optional(),
  /** Sentry DSN — leave empty to disable error tracking */
  SENTRY_DSN: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().url().optional(),
  ),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  const data = parsed.data;

  // Trim AWS credentials (common .env copy/paste issue)
  if (data.AWS_ACCESS_KEY_ID) data.AWS_ACCESS_KEY_ID = data.AWS_ACCESS_KEY_ID.trim();
  if (data.AWS_SECRET_ACCESS_KEY) data.AWS_SECRET_ACCESS_KEY = data.AWS_SECRET_ACCESS_KEY.trim();
  if (data.AWS_S3_BUCKET) data.AWS_S3_BUCKET = data.AWS_S3_BUCKET.trim();
  if (data.MINIMAX_API_KEY) data.MINIMAX_API_KEY = data.MINIMAX_API_KEY.trim();
  if (data.OPENAI_API_KEY) data.OPENAI_API_KEY = data.OPENAI_API_KEY.trim();

  if (!data.STRIPE_SUCCESS_URL) {
    data.STRIPE_SUCCESS_URL = `${data.FRONTEND_URL}/settings?billing=success`;
  }
  if (!data.STRIPE_CANCEL_URL) {
    data.STRIPE_CANCEL_URL = `${data.FRONTEND_URL}/settings?billing=canceled`;
  }

  return data;
}

export const env = loadEnv();
