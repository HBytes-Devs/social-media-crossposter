import type { SocialAccount } from "../types";

const EXPIRING_SOON_MS = 7 * 24 * 60 * 60 * 1000;

export type AccountTokenIssue = {
  account: SocialAccount;
  kind: "expired" | "expiring_soon";
  expiresAt: Date;
};

export type AccountConnectionStatus = "ok" | "expired" | "expiring_soon" | "unknown";

export function getAccountConnectionStatus(account: SocialAccount): AccountConnectionStatus {
  if (!account.expiresAt) return "unknown";

  const expiresAt = new Date(account.expiresAt);
  const msLeft = expiresAt.getTime() - Date.now();

  if (msLeft <= 0) return "expired";
  if (msLeft <= EXPIRING_SOON_MS) return "expiring_soon";
  return "ok";
}

export function isAccountConnectionBroken(account: SocialAccount): boolean {
  return getAccountConnectionStatus(account) === "expired";
}

export function describeConnectionIssue(account: SocialAccount): string | null {
  const status = getAccountConnectionStatus(account);
  const label = account.accountName ?? account.platform;

  if (status === "expired") {
    return `${label} connection failed — token expire ho gaya. Accounts page se dubara connect karo.`;
  }
  if (status === "expiring_soon" && account.expiresAt) {
    const days = Math.ceil(
      (new Date(account.expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000),
    );
    return `${label} token ${days} din mein expire hoga — jald reconnect karo.`;
  }
  return null;
}

export function isAuthConnectionError(message: string): boolean {
  return /401|403|unauthorized|token|expired|reconnect|invalid.*grant|access.denied/i.test(
    message,
  );
}

export function formatOAuthError(code: string): string {
  const normalized = code.trim().toLowerCase().replace(/\s+/g, "_");

  const map: Record<string, string> = {
    access_denied: "Authorization cancel ho gayi — dubara connect karke Allow dabao.",
    missing_code_or_state: "OAuth incomplete — connect flow dubara start karo.",
    oauth_failed: "Platform connect fail ho gaya — thodi der baad dubara try karo.",
    user_cancelled_authorize: "Authorization cancel ho gayi — dubara connect karke Allow dabao.",
  };

  return map[normalized] ?? `Connection failed: ${code}`;
}

export function getAccountTokenIssues(accounts: SocialAccount[]): AccountTokenIssue[] {
  const now = Date.now();
  const issues: AccountTokenIssue[] = [];

  for (const account of accounts) {
    if (!account.expiresAt) continue;

    const expiresAt = new Date(account.expiresAt);
    const msLeft = expiresAt.getTime() - now;

    if (msLeft <= 0) {
      issues.push({ account, kind: "expired", expiresAt });
    } else if (msLeft <= EXPIRING_SOON_MS) {
      issues.push({ account, kind: "expiring_soon", expiresAt });
    }
  }

  return issues.sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime());
}

export function formatTokenExpiryLabel(expiresAt: string | null): string | null {
  if (!expiresAt) return null;

  const date = new Date(expiresAt);
  const now = Date.now();
  const msLeft = date.getTime() - now;

  if (msLeft <= 0) return "Token expired — reconnect karo";
  if (msLeft <= EXPIRING_SOON_MS) {
    const days = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
    return `Token ${days} din mein expire hoga`;
  }

  return `Expires ${date.toLocaleDateString()}`;
}
