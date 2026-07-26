import type { AiProvider, UserAiCredential } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { AppError } from "../middleware/error.middleware.js";
import { decrypt, encrypt } from "./encryption.service.js";

function isMissingAiCredentialTable(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    (err.code === "P2021" || err.code === "P2010")
  );
}

export type AiCredentialPublic = {
  id: string;
  name: string;
  provider: AiProvider;
  model: string | null;
  baseUrl: string | null;
  isDefault: boolean;
  keyHint: string;
  createdAt: string;
  updatedAt: string;
};

export type ResolvedAiCredential = {
  id: string;
  name: string;
  provider: AiProvider;
  apiKey: string;
  baseUrl: string | null;
  model: string | null;
};

function maskApiKey(apiKey: string): string {
  const trimmed = apiKey.trim();
  if (trimmed.length <= 8) return "••••••••";
  return `${trimmed.slice(0, 3)}…${trimmed.slice(-4)}`;
}

function toPublic(credential: UserAiCredential, keyHint: string): AiCredentialPublic {
  return {
    id: credential.id,
    name: credential.name,
    provider: credential.provider,
    model: credential.model,
    baseUrl: credential.baseUrl,
    isDefault: credential.isDefault,
    keyHint,
    createdAt: credential.createdAt.toISOString(),
    updatedAt: credential.updatedAt.toISOString(),
  };
}

export function getProviderDefaults(provider: AiProvider): { baseUrl: string; model: string } {
  switch (provider) {
    case "MINIMAX":
      return { baseUrl: "https://api.minimax.io/v1", model: "MiniMax-M3" };
    case "OPENAI":
      return { baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" };
    case "ANTHROPIC":
      return { baseUrl: "https://api.anthropic.com/v1", model: "claude-3-5-sonnet-latest" };
    case "CUSTOM":
      return { baseUrl: "", model: "" };
    default:
      return { baseUrl: "", model: "" };
  }
}

export async function listAiCredentials(userId: string): Promise<AiCredentialPublic[]> {
  try {
    const rows = await prisma.userAiCredential.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });

    return rows.map((row) => {
      let hint = "••••••••";
      try {
        hint = maskApiKey(decrypt(row.apiKeyEnc));
      } catch {
        // keep masked placeholder
      }
      return toPublic(row, hint);
    });
  } catch (err) {
    if (isMissingAiCredentialTable(err)) return [];
    throw err;
  }
}

export async function createAiCredential(
  userId: string,
  input: {
    name: string;
    provider: AiProvider;
    apiKey: string;
    baseUrl?: string | null;
    model?: string | null;
    isDefault?: boolean;
  },
): Promise<AiCredentialPublic> {
  const defaults = getProviderDefaults(input.provider);
  const baseUrl = input.baseUrl?.trim() || defaults.baseUrl || null;
  const model = input.model?.trim() || defaults.model || null;

  if (input.provider === "CUSTOM" && (!baseUrl || !model)) {
    throw new AppError(400, "Custom provider ke liye base URL aur model zaroori hain");
  }

  const existingCount = await prisma.userAiCredential.count({ where: { userId } });
  const makeDefault = input.isDefault ?? existingCount === 0;

  if (makeDefault) {
    await prisma.userAiCredential.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const created = await prisma.userAiCredential.create({
    data: {
      userId,
      name: input.name.trim(),
      provider: input.provider,
      apiKeyEnc: encrypt(input.apiKey.trim()),
      baseUrl,
      model,
      isDefault: makeDefault,
    },
  });

  return toPublic(created, maskApiKey(input.apiKey));
}

export async function updateAiCredential(
  userId: string,
  credentialId: string,
  input: {
    name?: string;
    apiKey?: string;
    baseUrl?: string | null;
    model?: string | null;
    isDefault?: boolean;
  },
): Promise<AiCredentialPublic> {
  const existing = await prisma.userAiCredential.findFirst({
    where: { id: credentialId, userId },
  });

  if (!existing) {
    throw new AppError(404, "AI key not found");
  }

  if (input.isDefault) {
    await prisma.userAiCredential.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.userAiCredential.update({
    where: { id: credentialId },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.apiKey !== undefined ? { apiKeyEnc: encrypt(input.apiKey.trim()) } : {}),
      ...(input.baseUrl !== undefined ? { baseUrl: input.baseUrl?.trim() || null } : {}),
      ...(input.model !== undefined ? { model: input.model?.trim() || null } : {}),
      ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
    },
  });

  let hint = "••••••••";
  try {
    const key = input.apiKey ?? decrypt(existing.apiKeyEnc);
    hint = maskApiKey(key);
  } catch {
    // keep placeholder
  }

  return toPublic(updated, hint);
}

export async function deleteAiCredential(userId: string, credentialId: string): Promise<void> {
  const existing = await prisma.userAiCredential.findFirst({
    where: { id: credentialId, userId },
  });

  if (!existing) {
    throw new AppError(404, "AI key not found");
  }

  await prisma.userAiCredential.delete({ where: { id: credentialId } });

  if (existing.isDefault) {
    const next = await prisma.userAiCredential.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    if (next) {
      await prisma.userAiCredential.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }
}

export async function resolveAiCredential(userId: string): Promise<ResolvedAiCredential | null> {
  try {
    const row = await prisma.userAiCredential.findFirst({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });

    if (!row) return null;

    const defaults = getProviderDefaults(row.provider);

    return {
      id: row.id,
      name: row.name,
      provider: row.provider,
      apiKey: decrypt(row.apiKeyEnc),
      baseUrl: row.baseUrl ?? defaults.baseUrl ?? null,
      model: row.model ?? defaults.model ?? null,
    };
  } catch (err) {
    if (isMissingAiCredentialTable(err)) return null;
    throw err;
  }
}

function isOpenAiCompatibleBaseUrl(baseUrl: string | null | undefined): boolean {
  if (!baseUrl) return true;
  return /openai\.com/i.test(baseUrl);
}

export async function resolveOpenAiImageCredential(
  userId: string,
): Promise<ResolvedAiCredential | null> {
  let rows: UserAiCredential[] = [];
  try {
    rows = await prisma.userAiCredential.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
  } catch (err) {
    if (isMissingAiCredentialTable(err)) return null;
    throw err;
  }

  const openAiRow =
    rows.find((r) => r.provider === "OPENAI") ??
    rows.find(
      (r) =>
        r.provider === "CUSTOM" && isOpenAiCompatibleBaseUrl(r.baseUrl),
    );

  if (openAiRow) {
    const defaults = getProviderDefaults(openAiRow.provider);
    return {
      id: openAiRow.id,
      name: openAiRow.name,
      provider: openAiRow.provider,
      apiKey: decrypt(openAiRow.apiKeyEnc),
      baseUrl: openAiRow.baseUrl ?? defaults.baseUrl ?? "https://api.openai.com/v1",
      model: openAiRow.model ?? defaults.model ?? null,
    };
  }

  return null;
}

/** User's MiniMax credential for image generation (image-01). */
export async function resolveMiniMaxImageCredential(
  userId: string,
): Promise<ResolvedAiCredential | null> {
  let row: UserAiCredential | null = null;
  try {
    row = await prisma.userAiCredential.findFirst({
      where: { userId, provider: "MINIMAX" },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
  } catch (err) {
    if (isMissingAiCredentialTable(err)) return null;
    throw err;
  }

  if (!row) return null;

  const defaults = getProviderDefaults("MINIMAX");

  return {
    id: row.id,
    name: row.name,
    provider: row.provider,
    apiKey: decrypt(row.apiKeyEnc),
    baseUrl: row.baseUrl ?? defaults.baseUrl ?? null,
    model: row.model ?? defaults.model ?? null,
  };
}
