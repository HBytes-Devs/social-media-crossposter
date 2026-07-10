import type { AiProvider } from "@prisma/client";
import { env } from "../config/env.js";
import { AppError } from "../middleware/error.middleware.js";
import { logger } from "../utils/logger.js";
import type { ResolvedAiCredential } from "./ai-credentials.service.js";
import { resolveAiCredential } from "./ai-credentials.service.js";
import type { ChatMessage } from "./minimax.service.js";
import { isMiniMaxConfigured, stripThinkingBlocks } from "./minimax.service.js";

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
