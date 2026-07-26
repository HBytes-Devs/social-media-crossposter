import { env } from "../config/env.js";

type RecaptchaVerifyResponse = {
  success: boolean;
  score?: number;
  action?: string;
  "error-codes"?: string[];
};

/**
 * Returns true only when the value looks like a real secret — not a
 * `.env.example` placeholder (e.g. `your_recaptcha_secret_key`,
 * `change-this-...`, `<...>`, `xxx`). Without this guard, a developer
 * who hasn't filled in `.env` would get a 400 on every login because
 * the placeholder key fails Google's siteverify.
 */
function isRealSecret(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^(your[_-]|change[-_]this|<.*>|\{\{.*\}\}|xxx+|xxxx+|placeholder)/i.test(trimmed)) {
    return false;
  }
  return true;
}

export function isRecaptchaConfigured(): boolean {
  return isRealSecret(env.RECAPTCHA_SECRET_KEY);
}

export async function verifyRecaptcha(token?: string, expectedAction?: string): Promise<void> {
  if (!isRecaptchaConfigured()) {
    return;
  }

  if (!token?.trim()) {
    throw new Error("reCAPTCHA verification required");
  }

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: env.RECAPTCHA_SECRET_KEY!,
      response: token,
    }),
  });

  const data = (await response.json()) as RecaptchaVerifyResponse;

  if (!data.success) {
    throw new Error("reCAPTCHA verification failed");
  }

  if (data.score !== undefined && data.score < 0.5) {
    throw new Error("reCAPTCHA verification failed");
  }

  if (expectedAction && data.action && data.action !== expectedAction) {
    throw new Error("reCAPTCHA verification failed");
  }
}
