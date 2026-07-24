import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

let transporter: Transporter | null = null;

export function isEmailConfigured(): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

function getTransporter(): Transporter {
  if (!transporter) {
    if (!isEmailConfigured()) {
      throw new Error("SMTP is not configured");
    }

    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

function cleanFromAddress(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const from = cleanFromAddress(env.SMTP_FROM) ?? env.SMTP_USER;

  if (!isEmailConfigured()) {
    logger.info(`[email:dev] To: ${options.to} | Subject: ${options.subject}`);
    logger.info(`[email:dev] Body:\n${options.text}`);
    return;
  }

  await getTransporter().sendMail({
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}

export async function sendPasswordResetCode(email: string, code: string): Promise<void> {
  const subject = "SMC — Password reset code";
  const text = [
    "You requested a password reset for Social Media Crossposter (SMC).",
    "",
    `Your verification code: ${code}`,
    "",
    "This code expires in 15 minutes.",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `
    <p>You requested a password reset for <strong>Social Media Crossposter (SMC)</strong>.</p>
    <p style="font-size:24px;font-weight:bold;letter-spacing:4px;">${code}</p>
    <p>This code expires in <strong>15 minutes</strong>.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  await sendEmail({ to: email, subject, text, html });
}
