import type { HashtagMode } from "@prisma/client";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ur", label: "Urdu" },
  { code: "roman-ur", label: "Roman Urdu" },
  { code: "hi", label: "Hindi" },
  { code: "ar", label: "Arabic" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

const KEYWORD_RULES: Array<{ pattern: RegExp; tags: string[] }> = [
  { pattern: /\bnode\.?js\b|\bnodejs\b/i, tags: ["nodejs", "javascript"] },
  { pattern: /\btypescript\b|\bts\b/i, tags: ["typescript", "webdev"] },
  { pattern: /\breact\b/i, tags: ["react", "frontend"] },
  { pattern: /\bnext\.?js\b/i, tags: ["nextjs", "react"] },
  { pattern: /\baws\b|\bs3\b|\bcloud\b/i, tags: ["aws", "cloud"] },
  { pattern: /\blinkedin\b|\bsocial\s*media\b/i, tags: ["linkedin", "socialmedia"] },
  { pattern: /\bapi\b|\bbackend\b/i, tags: ["api", "backend"] },
  { pattern: /\bpostgres\b|\bsql\b|\bdatabase\b/i, tags: ["database", "postgresql"] },
  { pattern: /\bdocker\b|\bkubernetes\b|\bk8s\b/i, tags: ["docker", "devops"] },
  { pattern: /\bai\b|\bmachine\s*learning\b|\bml\b/i, tags: ["ai", "machinelearning"] },
  { pattern: /\bbuild\s*in\s*public\b/i, tags: ["buildinpublic", "indiehacker"] },
];

const LANGUAGE_DEFAULTS: Record<string, string[]> = {
  en: ["tech", "programming", "developer"],
  ur: ["tech", "programming", "developer"],
  "roman-ur": ["tech", "programming", "developer"],
  hi: ["tech", "coding", "developer"],
  ar: ["tech", "programming", "developer"],
};

const MAX_AUTO_TAGS = 5;

function normalizeTag(tag: string): string {
  return tag.trim().replace(/^#+/, "").replace(/\s+/g, "").toLowerCase();
}

export function normalizeHashtags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of tags) {
    const tag = normalizeTag(raw);
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    result.push(tag);
  }

  return result;
}

export function generateAutoHashtags(content: string, language: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();

  for (const rule of KEYWORD_RULES) {
    if (!rule.pattern.test(content)) continue;
    for (const tag of rule.tags) {
      if (!seen.has(tag)) {
        seen.add(tag);
        found.push(tag);
      }
    }
  }

  if (found.length < 3) {
    const defaults = LANGUAGE_DEFAULTS[language] ?? LANGUAGE_DEFAULTS.en;
    for (const tag of defaults) {
      if (found.length >= MAX_AUTO_TAGS) break;
      if (!seen.has(tag)) {
        seen.add(tag);
        found.push(tag);
      }
    }
  }

  return found.slice(0, MAX_AUTO_TAGS);
}

export function resolveHashtags(
  mode: HashtagMode,
  manualTags: string[],
  content: string,
  language: string,
): string[] {
  switch (mode) {
    case "NONE":
      return [];
    case "MANUAL":
      return normalizeHashtags(manualTags);
    case "AUTO":
    default:
      return generateAutoHashtags(content, language);
  }
}

export function formatHashtagLine(tags: string[]): string {
  if (tags.length === 0) return "";
  return tags.map((t) => `#${normalizeTag(t)}`).join(" ");
}

export function buildFinalContent(content: string, tags: string[]): string {
  const body = content.trim();
  const tagLine = formatHashtagLine(tags);

  if (!tagLine) return body;
  if (!body) return tagLine;
  return `${body}\n\n${tagLine}`;
}

export function previewPost(input: {
  content: string;
  hashtagMode: HashtagMode;
  hashtags: string[];
  language: string;
}): { hashtags: string[]; finalContent: string } {
  const tags = resolveHashtags(
    input.hashtagMode,
    input.hashtags,
    input.content,
    input.language,
  );

  return {
    hashtags: tags,
    finalContent: buildFinalContent(input.content, tags),
  };
}
