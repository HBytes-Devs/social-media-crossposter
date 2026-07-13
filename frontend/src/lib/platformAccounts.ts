import type { SocialAccount } from "../types";

/** Merge composer + accounts slice lists (dedupe by id). */
export function mergePlatformAccounts(
  composerAccounts: SocialAccount[],
  sliceAccounts: SocialAccount[],
): SocialAccount[] {
  const map = new Map<string, SocialAccount>();
  for (const account of [...composerAccounts, ...sliceAccounts]) {
    map.set(account.id, account);
  }
  return Array.from(map.values());
}

export function pickDefaultAccountId(accounts: SocialAccount[]): string | null {
  if (accounts.length === 0) return null;
  return (accounts.find((a) => a.platform === "LINKEDIN") ?? accounts[0])!.id;
}
