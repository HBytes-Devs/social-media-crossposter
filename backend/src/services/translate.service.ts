import { isAiConfiguredForUser } from "./ai-provider.service.js";
import { localizeWithAi } from "./ai-compose.service.js";

const API_LANG_CODES: Record<string, string> = {
  zh: "zh-CN",
  hi: "hi",
  es: "es",
  fr: "fr",
  ar: "ar",
  bn: "bn",
  pt: "pt",
  ru: "ru",
  ur: "ur",
  tr: "tr",
  he: "he",
};

type PhraseEntry = {
  pattern: RegExp;
  translations: Record<string, string>;
};

const PHRASE_ENTRIES: PhraseEntry[] = [
  {
    pattern: /\bhow are you\s+sir\b/gi,
    translations: {
      zh: "先生，你好吗？",
      hi: "सर, आप कैसे हैं?",
      es: "¿Cómo está, señor?",
      fr: "Comment allez-vous, monsieur ?",
      ar: "كيف حالك يا سيدي؟",
      bn: "স্যার, আপনি কেমন আছেন?",
      pt: "Como vai o senhor?",
      ru: "Как дела, сэр?",
      ur: "سر، آپ کیسے ہیں؟",
      tr: "Bayım, nasılsınız?",
      he: "מה שלומך, סר?",
      "roman-ur": "Sir, aap kaise hain?",
    },
  },
  {
    pattern: /\bhow are you\s+doing\s+today\b/gi,
    translations: {
      zh: "你今天好吗？",
      hi: "आज आप कैसे हैं?",
      es: "¿Cómo estás hoy?",
      fr: "Comment allez-vous aujourd'hui ?",
      ar: "كيف حالك اليوم؟",
      bn: "আজ আপনি কেমন আছেন?",
      pt: "Como você está hoje?",
      ru: "Как у вас дела сегодня?",
      ur: "آج آپ کیسے ہیں؟",
      tr: "Bugün nasılsınız?",
      he: "מה שלומך היום?",
      "roman-ur": "Aaj aap kaise hain?",
    },
  },
  {
    pattern: /\bhow are you\s+doing\b/gi,
    translations: {
      zh: "你好吗？",
      hi: "आप कैसे हैं?",
      es: "¿Cómo estás?",
      fr: "Comment allez-vous ?",
      ar: "كيف حالك؟",
      bn: "আপনি কেমন আছেন?",
      pt: "Como você está?",
      ru: "Как дела?",
      ur: "آپ کیسے ہیں؟",
      tr: "Nasılsınız?",
      he: "מה שלומך?",
      "roman-ur": "Aap kaise hain?",
    },
  },
  {
    pattern: /\bhow are you\b/gi,
    translations: {
      zh: "你好吗？",
      hi: "आप कैसे हैं?",
      es: "¿Cómo estás?",
      fr: "Comment allez-vous ?",
      ar: "كيف حالك؟",
      bn: "আপনি কেমন আছেন?",
      pt: "Como você está?",
      ru: "Как дела?",
      ur: "آپ کیسے ہیں؟",
      tr: "Nasılsınız?",
      he: "מה שלומך?",
      "roman-ur": "Aap kaise hain?",
    },
  },
  {
    pattern: /\bhello\b/gi,
    translations: {
      zh: "你好",
      hi: "नमस्ते",
      es: "Hola",
      fr: "Bonjour",
      ar: "مرحبا",
      bn: "হ্যালো",
      pt: "Olá",
      ru: "Привет",
      ur: "سلام",
      tr: "Merhaba",
      he: "שלום",
      "roman-ur": "Salam",
    },
  },
  {
    pattern: /\bhi\b/gi,
    translations: {
      zh: "你好",
      hi: "नमस्ते",
      es: "Hola",
      fr: "Salut",
      ar: "أهلا",
      bn: "হাই",
      pt: "Oi",
      ru: "Привет",
      ur: "سلام",
      tr: "Merhaba",
      he: "שלום",
      "roman-ur": "Salam",
    },
  },
  {
    pattern: /\bgood morning\b/gi,
    translations: {
      zh: "早上好",
      hi: "सुप्रभात",
      es: "Buenos días",
      fr: "Bonjour",
      ar: "صباح الخير",
      bn: "সুপ্রভাত",
      pt: "Bom dia",
      ru: "Доброе утро",
      ur: "صبح بخیر",
      tr: "Günaydın",
      he: "בוקר טוב",
      "roman-ur": "Subah bakhair",
    },
  },
  {
    pattern: /\bgood evening\b/gi,
    translations: {
      zh: "晚上好",
      hi: "शुभ संध्या",
      es: "Buenas tardes",
      fr: "Bonsoir",
      ar: "مساء الخير",
      bn: "শুভ সন্ধ্যা",
      pt: "Boa noite",
      ru: "Добрый вечер",
      ur: "شام بخیر",
      tr: "İyi akşamlar",
      he: "ערב טוב",
      "roman-ur": "Shaam bakhair",
    },
  },
  {
    pattern: /\bgood night\b/gi,
    translations: {
      zh: "晚安",
      hi: "शुभ रात्रि",
      es: "Buenas noches",
      fr: "Bonne nuit",
      ar: "تصبح على خير",
      bn: "শুভ রাত্রি",
      pt: "Boa noite",
      ru: "Спокойной ночи",
      ur: "شب بخیر",
      tr: "İyi geceler",
      he: "לילה טוב",
      "roman-ur": "Shab bakhair",
    },
  },
  {
    pattern: /\bthank you\b/gi,
    translations: {
      zh: "谢谢",
      hi: "धन्यवाद",
      es: "Gracias",
      fr: "Merci",
      ar: "شكرا",
      bn: "ধন্যবাদ",
      pt: "Obrigado",
      ru: "Спасибо",
      ur: "شکریہ",
      tr: "Teşekkür ederim",
      he: "תודה",
      "roman-ur": "Shukriya",
    },
  },
  {
    pattern: /\bi am (?:doing )?well\b/gi,
    translations: {
      zh: "我很好",
      hi: "मैं ठीक हूं",
      es: "Estoy bien",
      fr: "Je vais bien",
      ar: "أنا بخير",
      bn: "আমি ভালো আছি",
      pt: "Estou bem",
      ru: "У меня всё хорошо",
      ur: "میں ٹھیک ہوں",
      tr: "İyiyim",
      he: "אני בסדר",
      "roman-ur": "Main theek hoon",
    },
  },
  {
    pattern: /\bi am fine\b/gi,
    translations: {
      zh: "我很好",
      hi: "मैं ठीक हूं",
      es: "Estoy bien",
      fr: "Je vais bien",
      ar: "أنا بخير",
      bn: "আমি ভালো আছি",
      pt: "Estou bem",
      ru: "У меня всё хорошо",
      ur: "میں ٹھیک ہوں",
      tr: "İyiyim",
      he: "אני בסדר",
      "roman-ur": "Main theek hoon",
    },
  },
];

const ROMANIZE_WORDS: Array<[RegExp, string]> = [
  [/آپ/g, "Aap"],
  [/کیسے/g, "kaise"],
  [/ہیں/g, "hain"],
  [/سر/g, "sir"],
  [/سلام/g, "Salam"],
  [/میں/g, "Main"],
  [/ہوں/g, "hoon"],
  [/آج/g, "Aaj"],
  [/ٹھیک/g, "theek"],
  [/اچھا/g, "achha"],
  [/شکریہ/g, "Shukriya"],
  [/صبح/g, "Subah"],
  [/بخیر/g, "bakhair"],
  [/شام/g, "Shaam"],
  [/شب/g, "Shab"],
];

function romanizeUrduScript(text: string): string {
  let result = text;
  for (const [pattern, replacement] of ROMANIZE_WORDS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

export function applyPhraseTranslations(text: string, language: string): string {
  if (language === "en" || !text.trim()) return text;

  let result = text;
  for (const entry of PHRASE_ENTRIES) {
    const translation = entry.translations[language];
    if (!translation) continue;
    result = result.replace(entry.pattern, translation);
  }

  return result;
}

async function translateChunk(text: string, language: string): Promise<string | null> {
  const target = API_LANG_CODES[language];
  if (!target) return null;

  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `en|${target}`);

  const response = await fetch(url.toString());
  if (!response.ok) return null;

  const data = (await response.json()) as {
    responseData?: { translatedText?: string };
  };

  const translated = data.responseData?.translatedText?.trim();
  if (!translated || translated.toUpperCase() === text.toUpperCase()) return null;

  return translated;
}

const MYMEMORY_CHAR_LIMIT = 480;

async function translateWithApi(text: string, language: string): Promise<string | null> {
  if (text.length <= MYMEMORY_CHAR_LIMIT) {
    return translateChunk(text, language);
  }

  const paragraphs = text.split(/\n{2,}/);
  const translatedParts: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      translatedParts.push("");
      continue;
    }

    if (paragraph.length <= MYMEMORY_CHAR_LIMIT) {
      const part = await translateChunk(paragraph, language);
      if (!part) return null;
      translatedParts.push(part);
      continue;
    }

    const sentences = paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [paragraph];
    const sentenceParts: string[] = [];

    for (const sentence of sentences) {
      const chunk = sentence.trim();
      if (!chunk) continue;
      const part = await translateChunk(chunk.slice(0, MYMEMORY_CHAR_LIMIT), language);
      if (!part) return null;
      sentenceParts.push(part);
    }

    translatedParts.push(sentenceParts.join(" "));
  }

  return translatedParts.join("\n\n");
}

export async function localizeContent(
  text: string,
  language: string,
  userId?: string,
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || language === "en") return text;

  if (language === "roman-ur") {
    const urdu = await translateWithApi(text, "ur");
    if (urdu) return romanizeUrduScript(urdu);
    return applyPhraseTranslations(text, language);
  }

  const aiAvailable = userId
    ? await isAiConfiguredForUser(userId)
    : false;

  if (aiAvailable && userId) {
    try {
      const ai = await localizeWithAi(userId, { content: text, language });
      if (ai.content.trim()) return ai.content;
    } catch {
      // fall back to MyMemory
    }
  }

  const apiResult = await translateWithApi(text, language);
  if (apiResult) return apiResult;

  return applyPhraseTranslations(text, language);
}
