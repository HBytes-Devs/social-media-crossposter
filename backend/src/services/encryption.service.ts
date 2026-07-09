import crypto from "crypto";
import { env } from "../config/env.js";

function getKey(): Buffer {
  return crypto.createHash("sha256").update(env.TOKEN_ENCRYPTION_KEY).digest();
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decrypt(encrypted: string): string {
  const buf = Buffer.from(encrypted, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

export function generateStateToken(userId: string, extra?: Record<string, unknown>): string {
  const payload = JSON.stringify({ userId, ts: Date.now(), ...extra });
  return encrypt(payload);
}

export function verifyStateToken(state: string): {
  userId: string;
  extra: Record<string, unknown>;
} {
  try {
    const payload = JSON.parse(decrypt(state)) as {
      userId: string;
      ts: number;
      [key: string]: unknown;
    };

    if (!payload.userId || Date.now() - payload.ts > 10 * 60 * 1000) {
      throw new Error("State expired");
    }

    const { userId, ts: _ts, ...extra } = payload;
    return { userId, extra };
  } catch {
    throw new Error("Invalid OAuth state");
  }
}
