import type { AiProvider } from "@prisma/client";
import { env } from "../config/env.js";
import { AppError } from "../middleware/error.middleware.js";
import { logger } from "../utils/logger.js";
import type { ResolvedAiCredential } from "./ai-credentials.service.js";
import { resolveAiCredential, resolveMiniMaxImageCredential, resolveOpenAiImageCredential } from "./ai-credentials.service.js";
import type { ChatMessage } from "./minimax.service.js";
import { isMiniMaxConfigured, miniMaxGenerateImage, stripThinkingBlocks } from "./minimax.service.js";

export type ImageGenProvider = "minimax" | "openai";

export type ResolvedImageCredential = {
  provider: ImageGenProvider;
  credential: ResolvedAiCredential;
};

export type AiChatOptions = {
  temperature?: number;
  maxTokens?: number;
};

function getEnvFallbackCredential(): ResolvedAiCredential | null {
  const apiKey = env.MINIMAX_API_KEY?.trim();
  if (!apiKey) return null;

  return {
    id: "env-minimax",
    name: "Server MiniMax",
    provider: "MINIMAX",
    apiKey,
    baseUrl: env.MINIMAX_BASE_URL,
    model: env.MINIMAX_MODEL,
  };
}

export async function resolveUserAiCredential(userId: string): Promise<ResolvedAiCredential | null> {
  const userCredential = await resolveAiCredential(userId);
  if (userCredential) return userCredential;
  return getEnvFallbackCredential();
}

export async function isAiConfiguredForUser(userId: string): Promise<boolean> {
  return Boolean(await resolveUserAiCredential(userId));
}

async function openAiCompatibleChat(
  credential: ResolvedAiCredential,
  messages: ChatMessage[],
  options?: AiChatOptions,
): Promise<string> {
  const baseUrl = (credential.baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = credential.model ?? "gpt-4o-mini";

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 1024,
  };

  if (credential.provider === "MINIMAX") {
    body.reasoning_split = true;
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${credential.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    const message = data.error?.message ?? `AI API error (${response.status})`;
    logger.error("AI provider error", {
      provider: credential.provider,
      status: response.status,
      message,
    });
    throw new AppError(502, message);
  }

  const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
  const content =
    credential.provider === "MINIMAX" ? stripThinkingBlocks(raw) : raw;

  if (!content) {
    throw new AppError(502, "AI returned an empty response");
  }

  return content;
}

async function anthropicChat(
  credential: ResolvedAiCredential,
  messages: ChatMessage[],
  options?: AiChatOptions,
): Promise<string> {
  const baseUrl = (credential.baseUrl ?? "https://api.anthropic.com/v1").replace(/\/$/, "");
  const model = credential.model ?? "claude-3-5-sonnet-latest";

  const systemParts = messages.filter((m) => m.role === "system").map((m) => m.content);
  const conversation = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }));

  const response = await fetch(`${baseUrl}/messages`, {
    method: "POST",
    headers: {
      "x-api-key": credential.apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: options?.maxTokens ?? 1024,
      temperature: options?.temperature ?? 0.7,
      ...(systemParts.length > 0 ? { system: systemParts.join("\n\n") } : {}),
      messages: conversation,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as {
    content?: Array<{ type?: string; text?: string }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    const message = data.error?.message ?? `Anthropic API error (${response.status})`;
    logger.error("Anthropic API error", { status: response.status, message });
    throw new AppError(502, message);
  }

  const content = data.content
    ?.filter((block) => block.type === "text")
    .map((block) => block.text ?? "")
    .join("")
    .trim();

  if (!content) {
    throw new AppError(502, "Claude returned an empty response");
  }

  return content;
}

function getEnvOpenAiImageCredential(): ResolvedAiCredential | null {
  const apiKey = env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  return {
    id: "env-openai-image",
    name: "Server OpenAI",
    provider: "OPENAI",
    apiKey,
    baseUrl: "https://api.openai.com/v1",
    model: env.OPENAI_IMAGE_MODEL,
  };
}

export async function resolveUserImageCredential(
  userId: string,
): Promise<ResolvedImageCredential | null> {
  const miniMaxUser = await resolveMiniMaxImageCredential(userId);
  if (miniMaxUser) {
    return { provider: "minimax", credential: miniMaxUser };
  }

  const miniMaxEnv = getEnvFallbackCredential();
  if (miniMaxEnv) {
    return { provider: "minimax", credential: miniMaxEnv };
  }

  const openAiUser = await resolveOpenAiImageCredential(userId);
  if (openAiUser) {
    return { provider: "openai", credential: openAiUser };
  }

  const openAiEnv = getEnvOpenAiImageCredential();
  if (openAiEnv) {
    return { provider: "openai", credential: openAiEnv };
  }

  return null;
}

/** @deprecated Use resolveUserImageCredential */
export async function resolveUserOpenAiImageCredential(
  userId: string,
): Promise<ResolvedAiCredential | null> {
  const resolved = await resolveUserImageCredential(userId);
  return resolved?.credential ?? null;
}

export async function canGenerateImagesForUser(userId: string): Promise<boolean> {
  return Boolean(await resolveUserImageCredential(userId));
}

export async function userAiGenerateImage(userId: string, prompt: string): Promise<Buffer> {
  const resolved = await resolveUserImageCredential(userId);
  if (!resolved) {
    throw new AppError(
      503,
      "Image generation ke liye Settings mein MiniMax ya OpenAI API key add karo, ya server par MINIMAX_API_KEY set karo.",
    );
  }

  if (resolved.provider === "minimax") {
    return miniMaxGenerateImage(
      resolved.credential.apiKey,
      prompt,
      resolved.credential.baseUrl ?? undefined,
    );
  }

  return openAiGenerateImage(resolved.credential, prompt, "1792x1024");
}

export async function openAiGenerateImage(
  credential: ResolvedAiCredential,
  prompt: string,
  size: "1792x1024" | "1024x1024" = "1792x1024",
): Promise<Buffer> {
  const baseUrl = (credential.baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = env.OPENAI_IMAGE_MODEL;

  const response = await fetch(`${baseUrl}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${credential.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size,
      response_format: "b64_json",
      quality: "standard",
    }),
  });

  const data = (await response.json().catch(() => ({}))) as {
    data?: Array<{ b64_json?: string }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    const message = data.error?.message ?? `Image API error (${response.status})`;
    logger.error("OpenAI image error", { status: response.status, message });
    throw new AppError(502, message);
  }

  const b64 = data.data?.[0]?.b64_json;
  if (!b64) {
    throw new AppError(502, "Image API returned no image data");
  }

  return Buffer.from(b64, "base64");
}

export async function userAiChat(
  userId: string,
  messages: ChatMessage[],
  options?: AiChatOptions,
): Promise<string> {
  const credential = await resolveUserAiCredential(userId);

  if (!credential) {
    throw new AppError(
      503,
      "AI is not configured. Settings mein apni API key add karo.",
    );
  }

  switch (credential.provider as AiProvider) {
    case "ANTHROPIC":
      return anthropicChat(credential, messages, options);
    case "MINIMAX":
    case "OPENAI":
    case "CUSTOM":
    default:
      return openAiCompatibleChat(credential, messages, options);
  }
}

export function getLegacyAiConfigured(): boolean {
  return isMiniMaxConfigured();
}
