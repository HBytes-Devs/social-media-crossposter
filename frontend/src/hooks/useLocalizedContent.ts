import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { applyPhraseTranslations, localizeContent } from "../lib/translate";

export function useLocalizedContent(
  text: string,
  language: string,
  token?: string | null,
) {
  const [localized, setLocalized] = useState(() =>
    language === "en" ? text : applyPhraseTranslations(text, language),
  );

  useEffect(() => {
    if (language === "en" || !text.trim()) {
      setLocalized(text);
      return;
    }

    const instant = applyPhraseTranslations(text, language);
    setLocalized(instant);

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        if (token) {
          const ai = await api.localizeWithAi(token, { content: text, language });
          if (!cancelled && ai.content.trim()) {
            setLocalized(ai.content);
            return;
          }
        }
      } catch {
        // fall back to client translation
      }

      const result = await localizeContent(text, language);
      if (!cancelled) setLocalized(result);
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, language, token]);

  return localized;
}
