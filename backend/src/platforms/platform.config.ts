import crypto from "crypto";
import type { Platform } from "@prisma/client";
import { env } from "../config/env.js";

export const META_GRAPH_VERSION = "v21.0";

export type PlatformStatus = {
  id: Platform;
  name: string;
  slug: string;
  description: string;
  implemented: boolean;
  configured: boolean;
  connectMethod: "oauth";
  setupHint?: string;
};

function metaConfigured(): boolean {
  return Boolean(env.META_APP_ID && env.META_APP_SECRET);
}

export function isPlatformConfigured(platform: Platform): boolean {
  switch (platform) {
    case "LINKEDIN":
      return Boolean(
        env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET && env.LINKEDIN_REDIRECT_URI,
      );
    case "FACEBOOK":
      return metaConfigured() && Boolean(env.META_REDIRECT_URI);
    case "INSTAGRAM":
      return Boolean(
        getInstagramRedirectUri() &&
          ((env.META_USE_INSTAGRAM_LOGIN ?? "").toLowerCase() === "true"
            ? (env.META_INSTAGRAM_APP_ID || env.META_APP_ID) &&
              (env.META_INSTAGRAM_APP_SECRET || env.META_APP_SECRET)
            : env.META_APP_ID && env.META_APP_SECRET),
      );
    case "TWITTER":
      return Boolean(
        env.TWITTER_CLIENT_ID && env.TWITTER_CLIENT_SECRET && env.TWITTER_REDIRECT_URI,
      );
    case "REDDIT":
      return Boolean(
        env.REDDIT_CLIENT_ID && env.REDDIT_CLIENT_SECRET && env.REDDIT_REDIRECT_URI,
      );
    default:
      return false;
  }
}

export function getInstagramRedirectUri(): string {
  const raw =
    env.META_INSTAGRAM_REDIRECT_URI ??
    `${env.API_BASE_URL}/api/v1/accounts/instagram/callback`;
  return raw.trim();
}

/** Pick preferred Facebook Page when the user manages several (e.g. HawkBytes vs hamza-toto). */
export function pickPreferredMetaPage<T extends { id: string; name: string }>(
  pages: T[],
): T | undefined {
  if (pages.length === 0) return undefined;

  const preferredId = env.META_PREFERRED_PAGE_ID?.trim();
  if (preferredId) {
    const byId = pages.find((p) => p.id === preferredId);
    if (byId) return byId;
  }

  const preferredName = env.META_PREFERRED_PAGE_NAME?.trim().toLowerCase();
  if (preferredName) {
    const exact = pages.find((p) => p.name.trim().toLowerCase() === preferredName);
    if (exact) return exact;
    const partial = pages.find((p) => p.name.trim().toLowerCase().includes(preferredName));
    if (partial) return partial;
  }

  return pages[0];
}

export function getPlatformStatuses(): PlatformStatus[] {
  return [
    {
      id: "LINKEDIN",
      name: "LinkedIn",
      slug: "linkedin",
      description: "Professional posts & articles",
      implemented: true,
      configured: isPlatformConfigured("LINKEDIN"),
      connectMethod: "oauth",
      setupHint: "Add LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_REDIRECT_URI to .env",
    },
    {
      id: "INSTAGRAM",
      name: "Instagram",
      slug: "instagram",
      description: "Photos, reels & stories (Business account)",
      implemented: true,
      configured: isPlatformConfigured("INSTAGRAM"),
      connectMethod: "oauth",
      setupHint: "Add META_APP_ID, META_APP_SECRET — Instagram Business account required",
    },
    {
      id: "FACEBOOK",
      name: "Facebook",
      slug: "facebook",
      description: "Facebook Pages posts",
      implemented: true,
      configured: isPlatformConfigured("FACEBOOK"),
      connectMethod: "oauth",
      setupHint: "Add META_APP_ID, META_APP_SECRET, META_REDIRECT_URI to .env",
    },
    {
      id: "TWITTER",
      name: "X (Twitter)",
      slug: "twitter",
      description: "Short posts & threads",
      implemented: true,
      configured: isPlatformConfigured("TWITTER"),
      connectMethod: "oauth",
      setupHint: "Add TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, TWITTER_REDIRECT_URI to .env",
    },
    {
      id: "REDDIT",
      name: "Reddit",
      slug: "reddit",
      description: "Subreddit posts",
      implemented: true,
      configured: isPlatformConfigured("REDDIT"),
      connectMethod: "oauth",
      setupHint: "Add REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_REDIRECT_URI to .env",
    },
  ];
}

export function generatePkce(): { verifier: string; challenge: string } {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchForm<T>(url: string, body: URLSearchParams): Promise<T> {
  return fetchJson<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
}
