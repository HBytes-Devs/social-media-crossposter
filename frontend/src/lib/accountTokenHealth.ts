import type { SocialAccount } from "../types";

const EXPIRING_SOON_MS = 7 * 24 * 60 * 60 * 1000;

export type AccountTokenIssue = {
  account: SocialAccount;
  kind: "expired" | "expiring_soon";
  expiresAt: Date;
};

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
