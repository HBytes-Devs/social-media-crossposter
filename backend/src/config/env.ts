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
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_REDIRECT_URI: z.string().optional(),
  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  META_REDIRECT_URI: z.string().optional(),
  META_INSTAGRAM_REDIRECT_URI: z.string().optional(),
  TWITTER_CLIENT_ID: z.string().optional(),
  TWITTER_CLIENT_SECRET: z.string().optional(),
  TWITTER_REDIRECT_URI: z.string().optional(),
  REDDIT_CLIENT_ID: z.string().optional(),
  REDDIT_CLIENT_SECRET: z.string().optional(),
  REDDIT_REDIRECT_URI: z.string().optional(),
  REDDIT_USER_AGENT: z.string().optional(),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  LINKEDIN_API_VERSION: z.string().default("202601"),
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

  return data;
}

export const env = loadEnv();
