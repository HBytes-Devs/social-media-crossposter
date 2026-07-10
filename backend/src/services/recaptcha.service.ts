import { env } from "../config/env.js";

type RecaptchaVerifyResponse = {
  success: boolean;
  score?: number;
  action?: string;
  "error-codes"?: string[];
};

export function isRecaptchaConfigured(): boolean {
  return Boolean(env.RECAPTCHA_SECRET_KEY);
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
