import type { Platform, Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { AppError } from "../middleware/error.middleware.js";
import { getPlatformAdapter, isPlatformSupported } from "../platforms/platform.factory.js";
import {
  generatePkce,
  getPlatformStatuses,
  isPlatformConfigured,
  type PlatformStatus,
} from "../platforms/platform.config.js";
import { encrypt, decrypt, generateStateToken, verifyStateToken } from "./encryption.service.js";
import * as planService from "./plan.service.js";

export type SocialAccountPublic = {
  id: string;
  platform: Platform;
  accountId: string;
  accountName: string | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
};

function toPublicAccount(account: {
  id: string;
  platform: Platform;
  accountId: string;
  accountName: string | null;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
}): SocialAccountPublic {
  return {
    id: account.id,
    platform: account.platform,
    accountId: account.accountId,
    accountName: account.accountName,
    isActive: account.isActive,
    expiresAt: account.expiresAt?.toISOString() ?? null,
    createdAt: account.createdAt.toISOString(),
  };
}

function ensurePlatformConfigured(platform: Platform): void {
  if (!isPlatformSupported(platform)) {
    throw new AppError(501, `Platform ${platform} is not supported yet`);
  }

  if (!isPlatformConfigured(platform)) {
    const status = getPlatformStatuses().find((p) => p.id === platform);
    throw new AppError(
      503,
      status?.setupHint ?? `${platform} is not configured. Add credentials to .env`,
    );
  }
}

export function listPlatformStatuses(): PlatformStatus[] {
  return getPlatformStatuses();
}

export function getConnectUrl(platform: Platform, userId: string): string {
  ensurePlatformConfigured(platform);
  const adapter = getPlatformAdapter(platform);

  if (platform === "TWITTER") {
    const pkce = generatePkce();
    const state = generateStateToken(userId, { pkce: pkce.verifier });
    return adapter.getAuthUrl(state, { codeChallenge: pkce.challenge });
  }

  const state = generateStateToken(userId);
  return adapter.getAuthUrl(state);
}

export async function handleOAuthCallback(
  platform: Platform,
  code: string,
  state: string,
): Promise<SocialAccountPublic> {
  ensurePlatformConfigured(platform);

  const { userId, extra } = verifyStateToken(state);
  const adapter = getPlatformAdapter(platform);
  const tokenResult = await adapter.handleCallback(code, extra);

  await planService.assertCanConnectExistingAccount(userId, platform, tokenResult.accountId);

  const account = await prisma.socialAccount.upsert({
    where: {
      userId_platform_accountId: {
        userId,
        platform,
        accountId: tokenResult.accountId,
      },
    },
    create: {
      userId,
      platform,
      accountId: tokenResult.accountId,
      accountName: tokenResult.accountName,
      accessToken: encrypt(tokenResult.accessToken),
      refreshToken: tokenResult.refreshToken ? encrypt(tokenResult.refreshToken) : null,
      expiresAt: tokenResult.expiresAt,
      scopes: tokenResult.scopes,
      metadata: (tokenResult.metadata ?? {}) as Prisma.InputJsonValue,
      isActive: true,
    },
    update: {
      accountName: tokenResult.accountName,
      accessToken: encrypt(tokenResult.accessToken),
      refreshToken: tokenResult.refreshToken ? encrypt(tokenResult.refreshToken) : null,
      expiresAt: tokenResult.expiresAt,
      scopes: tokenResult.scopes,
      metadata: (tokenResult.metadata ?? {}) as Prisma.InputJsonValue,
      isActive: true,
    },
  });

  return toPublicAccount(account);
}

export async function listAccounts(userId: string): Promise<SocialAccountPublic[]> {
  const accounts = await prisma.socialAccount.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return accounts.map(toPublicAccount);
}

export async function disconnectAccount(userId: string, accountId: string): Promise<void> {
  const account = await prisma.socialAccount.findFirst({
    where: { id: accountId, userId },
  });

  if (!account) {
    throw new AppError(404, "Account not found");
  }

  await prisma.socialAccount.update({
    where: { id: accountId },
    data: { isActive: false },
  });
}

export async function getDecryptedToken(accountId: string, userId: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  platform: Platform;
  accountId: string;
  metadata: Record<string, unknown>;
}> {
  const account = await prisma.socialAccount.findFirst({
    where: { id: accountId, userId, isActive: true },
  });

  if (!account) {
    throw new AppError(404, "Account not found");
  }

  return {
    accessToken: decrypt(account.accessToken),
    refreshToken: account.refreshToken ? decrypt(account.refreshToken) : undefined,
    platform: account.platform,
    accountId: account.accountId,
    metadata: (account.metadata as Record<string, unknown>) ?? {},
  };
}

const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

export async function getDecryptedTokenFresh(
  accountId: string,
  userId: string,
): Promise<Awaited<ReturnType<typeof getDecryptedToken>>> {
  const account = await prisma.socialAccount.findFirst({
    where: { id: accountId, userId, isActive: true },
  });

  if (!account) {
    throw new AppError(404, "Account not found");
  }

  const expiresSoon =
    account.expiresAt &&
    account.expiresAt.getTime() <= Date.now() + TOKEN_REFRESH_BUFFER_MS;

  if (expiresSoon && account.refreshToken) {
    try {
      await refreshAccountToken(userId, accountId);
    } catch {
      // publish will surface auth error; reconnect prompt in UI
    }
  }

  return getDecryptedToken(accountId, userId);
}

export async function refreshAccountToken(userId: string, accountId: string): Promise<SocialAccountPublic> {
  const account = await prisma.socialAccount.findFirst({
    where: { id: accountId, userId, isActive: true },
  });

  if (!account) {
    throw new AppError(404, "Account not found");
  }

  const adapter = getPlatformAdapter(account.platform);
  const accessToken = decrypt(account.accessToken);
  const refreshToken = account.refreshToken ? decrypt(account.refreshToken) : undefined;

  const tokenResult = await adapter.refreshToken(accessToken, refreshToken);

  const updated = await prisma.socialAccount.update({
    where: { id: accountId },
    data: {
      accessToken: encrypt(tokenResult.accessToken),
      refreshToken: tokenResult.refreshToken ? encrypt(tokenResult.refreshToken) : account.refreshToken,
      expiresAt: tokenResult.expiresAt,
      scopes: tokenResult.scopes,
    },
  });

  return toPublicAccount(updated);
}
