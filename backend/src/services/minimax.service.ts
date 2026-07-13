import { env } from "../config/env.js";
import { AppError } from "../middleware/error.middleware.js";
import { logger } from "../utils/logger.js";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
      reasoning_content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

export function stripThinkingBlocks(text: string): string {
  return text
    .replace(/[\s\S]*?<\/think>/gi, "")
    .replace(/<think>[\s\S]*?<\/redacted_thinking>/gi, "")
    .trim();
}

export function isMiniMaxConfigured(): boolean {
  return Boolean(env.MINIMAX_API_KEY?.trim());
}

export async function miniMaxChat(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number },
): Promise<string> {
  const apiKey = env.MINIMAX_API_KEY?.trim();
  if (!apiKey) {
    throw new AppError(503, "MiniMax AI is not configured. Add MINIMAX_API_KEY to backend/.env");
  }

  const url = `${env.MINIMAX_BASE_URL.replace(/\/$/, "")}/chat/completions`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.MINIMAX_MODEL,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1024,
      reasoning_split: true,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as ChatCompletionResponse;

  if (!response.ok) {
    const message = data.error?.message ?? `MiniMax API error (${response.status})`;
    logger.error("MiniMax API error", { status: response.status, message });
    throw new AppError(502, message);
  }

  const message = data.choices?.[0]?.message;
  const content = stripThinkingBlocks(message?.content?.trim() ?? "");
  if (!content) {
    throw new AppError(502, "MiniMax returned an empty response");
  }

  return content;
}

type MiniMaxImageResponse = {
  data?: { image_base64?: string[]; image_urls?: string[] };
  base_resp?: { status_code?: number; status_msg?: string };
  error?: { message?: string };
};

export async function miniMaxGenerateImage(
  apiKey: string,
  prompt: string,
  baseUrl?: string,
): Promise<Buffer> {
  const root = (baseUrl ?? env.MINIMAX_BASE_URL).replace(/\/$/, "");
  const url = `${root}/image_generation`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.MINIMAX_IMAGE_MODEL,
      prompt: prompt.slice(0, 1500),
      aspect_ratio: "16:9",
      response_format: "base64",
      n: 1,
      prompt_optimizer: true,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as MiniMaxImageResponse;

  if (!response.ok) {
    const message = data.error?.message ?? data.base_resp?.status_msg ?? `MiniMax image error (${response.status})`;
    logger.error("MiniMax image HTTP error", { status: response.status, message });
    throw new AppError(502, message);
  }

  if (data.base_resp?.status_code !== undefined && data.base_resp.status_code !== 0) {
    const message = data.base_resp.status_msg ?? "MiniMax image generation failed";
    logger.error("MiniMax image API error", { code: data.base_resp.status_code, message });
    throw new AppError(502, message);
  }

  const b64 = data.data?.image_base64?.[0];
  if (b64) {
    return Buffer.from(b64, "base64");
  }

  const imageUrl = data.data?.image_urls?.[0];
  if (imageUrl) {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      throw new AppError(502, "Failed to download generated image from MiniMax");
    }
    return Buffer.from(await imgRes.arrayBuffer());
  }

  throw new AppError(502, "MiniMax returned no image data");
}

export function parseJsonArray(text: string): string[] {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    const parsed = JSON.parse(jsonMatch[0]) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((tag) => tag.replace(/^#+/, "").trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}
