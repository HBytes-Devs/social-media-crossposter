import { env } from "../config/env.js";
import { SUPPORTED_LANGUAGES } from "./hashtags.service.js";
import { resolveUserAiCredential, userAiChat } from "./ai-provider.service.js";
import { isAiConfiguredForUser } from "./ai-provider.service.js";
import { parseJsonArray } from "./minimax.service.js";

const LANGUAGE_LABELS = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((lang) => [lang.code, lang.label]),
) as Record<string, string>;

function languageLabel(code?: string): string {
  if (!code) return "English";
  return LANGUAGE_LABELS[code] ?? code;
}

export async function getAiStatus(userId: string) {
  const configured = await isAiConfiguredForUser(userId);
  const credential = configured ? await resolveUserAiCredential(userId) : null;

  return {
    configured,
    provider: credential?.provider.toLowerCase() ?? "none",
    model: credential?.model ?? env.MINIMAX_MODEL,
    keyName: credential?.name ?? null,
    source: credential?.id === "env-minimax" ? "server" : credential ? "user" : "none",
    features: ["improve", "hashtags", "localize", "suggest", "correct"] as const,
  };
}

export async function improvePostContent(
  userId: string,
  input: {
    content: string;
    language?: string;
    tone?: "professional" | "casual" | "friendly";
    platform?: string;
  },
): Promise<{ content: string }> {
  const lang = languageLabel(input.language);
  const tone = input.tone ?? "professional";
  const platform = input.platform ?? "LinkedIn";

  const improved = await userAiChat(
    userId,
    [
      {
        role: "system",
        content: [
          "You are a social media copy editor for a cross-posting app.",
          "Rewrite the user's draft to be clear, engaging, and ready to publish.",
          `Target platform tone: ${platform}. Writing tone: ${tone}.`,
          `Output language: ${lang}.`,
          "Keep the original meaning. Do not invent facts.",
          "Return ONLY the improved post text — no quotes, no markdown, no explanation.",
        ].join(" "),
      },
      { role: "user", content: input.content },
    ],
    { temperature: 0.6, maxTokens: 1200 },
  );

  return { content: improved };
}

export async function generateSmartHashtags(
  userId: string,
  input: {
    content: string;
    language?: string;
    max?: number;
  },
): Promise<{ hashtags: string[] }> {
  const lang = languageLabel(input.language);
  const max = input.max ?? 8;

  const raw = await userAiChat(
    userId,
    [
      {
        role: "system",
        content: [
          "You generate social media hashtags from post content.",
          `Language context: ${lang}.`,
          `Return ONLY a JSON array of ${max} hashtag strings without # symbols.`,
          "Mix broad reach tags and niche topic tags.",
          "No explanation. Example: [\"webdev\", \"startup\", \"linkedin\"]",
        ].join(" "),
      },
      { role: "user", content: input.content },
    ],
    { temperature: 0.5, maxTokens: 300 },
  );

  const hashtags = parseJsonArray(raw).slice(0, max);
  return { hashtags };
}

export async function localizeWithAi(
  userId: string,
  input: {
    content: string;
    language: string;
  },
): Promise<{ content: string }> {
  const lang = languageLabel(input.language);

  const localized = await userAiChat(
    userId,
    [
      {
        role: "system",
        content: [
          "Translate or adapt social media post text naturally.",
          `Target language: ${lang}.`,
          "Preserve hashtags if present. Keep emojis when appropriate.",
          "Return ONLY the translated/adapted post — no explanation.",
        ].join(" "),
      },
      { role: "user", content: input.content },
    ],
    { temperature: 0.4, maxTokens: 1200 },
  );

  return { content: localized };
}

function stripRepeatedPrefix(source: string, continuation: string): string {
  let result = continuation.trim();
  if (!result) return "";

  const lowerSource = source.trimEnd().toLowerCase();
  const lowerResult = result.toLowerCase();

  if (lowerResult.startsWith(lowerSource)) {
    result = result.slice(source.trimEnd().length).trimStart();
  }

  return result.slice(0, 120);
}

export async function suggestCompletion(
  userId: string,
  input: {
    content: string;
    language?: string;
  },
): Promise<{ suggestion: string }> {
  const lang = languageLabel(input.language);
  const trimmed = input.content.trimEnd();

  if (trimmed.length < 8) {
    return { suggestion: "" };
  }

  const raw = await userAiChat(
    userId,
    [
      {
        role: "system",
        content: [
          "You complete social media post drafts like Gmail Smart Compose.",
          `Write in ${lang} — same language as the user's text (English, Turkish, Urdu, Hindi, etc.).`,
          "Return ONLY new words that continue after the user's text.",
          "Do NOT repeat or rewrite the user's existing words.",
          "Suggest 3 to 12 words to naturally finish the current sentence or thought.",
          "No quotes, no markdown, no explanation.",
        ].join(" "),
      },
      { role: "user", content: trimmed },
    ],
    { temperature: 0.45, maxTokens: 80 },
  );

  return { suggestion: stripRepeatedPrefix(trimmed, raw) };
}

export async function correctText(
  userId: string,
  input: {
    content: string;
    language?: string;
  },
): Promise<{ content: string; changed: boolean }> {
  const lang = languageLabel(input.language);
  const trimmed = input.content.trim();

  if (!trimmed) {
    return { content: input.content, changed: false };
  }

  const corrected = await userAiChat(
    userId,
    [
      {
        role: "system",
        content: [
          "You fix grammar, spelling, and punctuation for social media posts.",
          `Language: ${lang}. Keep the same language as the input.`,
          "Preserve meaning, tone, hashtags, emojis, and line breaks.",
          "Make minimal edits — only fix clear mistakes.",
          "Return ONLY the corrected full text — no explanation.",
        ].join(" "),
      },
      { role: "user", content: input.content },
    ],
    { temperature: 0.2, maxTokens: 1200 },
  );

  const normalized = corrected.trim();
  return {
    content: normalized || input.content,
    changed: normalized !== trimmed && normalized.length > 0,
  };
}
