import type { HashtagMode } from "@prisma/client";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh", label: "Mandarin Chinese" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "ar", label: "Arabic" },
  { code: "bn", label: "Bengali" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "ur", label: "Urdu" },
  { code: "tr", label: "Turkish" },
  { code: "he", label: "Hebrew" },
  { code: "roman-ur", label: "Roman Urdu" },
] as const;

export const LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((lang) => lang.code);

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

const LANGUAGE_KEYWORD_RULES: Record<string, Array<{ pattern: RegExp; tags: string[] }>> = {
  ar: [
    { pattern: /\b(مرحبا|السلام|كيف|حال|بخير)\b/i, tags: ["حياة", "يوميات", "تطوير_الذات"] },
    { pattern: /\b(برمجة|مطور|تقنية|تطبيق)\b/i, tags: ["برمجة", "تقنية", "مطور"] },
  ],
  ur: [
    { pattern: /\b(tech|coding|developer|salam|kaise)\b/i, tags: ["ٹیکنالوجی", "کوڈنگ"] },
    { pattern: /\b(سلام|کیسے|ٹھیک|اچھا)\b/i, tags: ["یومیہ", "زندگی"] },
  ],
  hi: [
    { pattern: /\b(नमस्ते|कैसे|ठीक|अच्छा)\b/i, tags: ["जीवन", "दैनिक"] },
    { pattern: /\b(tech|coding|developer)\b/i, tags: ["तकनीक", "कोडिंग"] },
  ],
};

const MAX_AUTO_TAGS = 5;
const MIN_TAG_LENGTH = 3;
const MAX_TAG_LENGTH = 30;

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
  "is", "are", "was", "were", "am", "be", "been", "being", "have", "has", "had",
  "do", "does", "did", "will", "would", "could", "should", "may", "might", "must",
  "i", "me", "my", "we", "our", "you", "your", "he", "she", "it", "they", "them",
  "this", "that", "these", "those", "what", "which", "who", "whom", "whose",
  "how", "when", "where", "why", "not", "no", "yes", "so", "very", "just", "now",
  "hello", "hi", "hey", "sir", "madam", "please", "thanks", "thank", "doing",
  "today", "well", "fine", "good", "great", "nice", "dear",
  "آپ", "میں", "ہے", "ہیں", "کا", "کی", "کے", "کو", "سے", "پر", "یا", "اور", "یہ", "وہ",
  "کیسے", "کیا", "سر", "سلام", "میرا", "آج", "ٹھیک", "اچھا",
  "कैसे", "मैं", "है", "हैं", "आप", "का", "की", "के", "में", "से", "और", "यह", "वह",
  "كيف", "حالك", "أنا", "في", "من", "على", "هذا", "هذه", "السلام", "مرحبا",
  "comment", "allez", "vous", "est", "son", "les", "des", "une", "pour", "avec",
]);

const CONVERSATION_RULES: Array<{ pattern: RegExp; tags: string[] }> = [
  { pattern: /\bhow are you\b/i, tags: ["greetings", "daily", "life"] },
  { pattern: /\bthank you\b|\bthanks\b/i, tags: ["gratitude", "thanks"] },
  { pattern: /\bgood morning\b/i, tags: ["morning", "greetings"] },
  { pattern: /\bbusiness\b|\bstartup\b/i, tags: ["business", "startup"] },
  { pattern: /\bmarketing\b|\bgrowth\b/i, tags: ["marketing", "growth"] },
  { pattern: /\bleadership\b|\bmanagement\b/i, tags: ["leadership", "management"] },
  { pattern: /\bcareer\b|\bjob\b|\bhiring\b/i, tags: ["career", "jobs"] },
  { pattern: /\bdesign\b|\bux\b|\bui\b/i, tags: ["design", "ux"] },
  { pattern: /\bproductivity\b|\bfocus\b/i, tags: ["productivity", "focus"] },
  { pattern: /\blearning\b|\beducation\b/i, tags: ["learning", "education"] },
];

function normalizeTag(tag: string): string {
  const cleaned = tag.trim().replace(/^#+/, "").replace(/\s+/g, "");
  if (/^[a-z0-9_]+$/i.test(cleaned)) return cleaned.toLowerCase();
  return cleaned;
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

function isStopWord(word: string): boolean {
  const lower = word.toLowerCase();
  return STOP_WORDS.has(lower) || STOP_WORDS.has(word);
}

function extractContentHashtags(content: string): string[] {
  const tokens = content
    .replace(/[#@]/g, " ")
    .replace(/[^\p{L}\p{N}\s_-]/gu, " ")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const tags: string[] = [];
  const seen = new Set<string>();

  for (const token of tokens) {
    const normalized = normalizeTag(token);
    if (!normalized) continue;
    if (normalized.length < MIN_TAG_LENGTH || normalized.length > MAX_TAG_LENGTH) continue;
    if (isStopWord(normalized)) continue;
    if (seen.has(normalized)) continue;

    seen.add(normalized);
    tags.push(normalized);

    if (tags.length >= MAX_AUTO_TAGS) break;
  }

  return tags;
}

export function generateAutoHashtags(content: string, language: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();

  const addTag = (tag: string) => {
    if (found.length >= MAX_AUTO_TAGS) return;
    const normalized = normalizeTag(tag);
    if (!normalized || seen.has(normalized)) return;
    if (isStopWord(normalized)) return;
    seen.add(normalized);
    found.push(normalized);
  };

  const allRules = [
    ...KEYWORD_RULES,
    ...CONVERSATION_RULES,
    ...(LANGUAGE_KEYWORD_RULES[language] ?? []),
  ];

  for (const rule of allRules) {
    if (!rule.pattern.test(content)) continue;
    for (const tag of rule.tags) {
      addTag(tag);
    }
  }

  for (const tag of extractContentHashtags(content)) {
    addTag(tag);
  }

  if (found.length === 0 && content.trim()) {
    const words = content
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((word) => word.length >= 2);

    for (const word of words) {
      addTag(word);
      if (found.length >= 3) break;
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
