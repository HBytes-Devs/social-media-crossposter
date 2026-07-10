import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

const SUGGEST_DELAY_MS = 750;
const CORRECT_DELAY_MS = 1800;
const MIN_SUGGEST_CHARS = 8;
const MIN_CORRECT_CHARS = 12;

type Options = {
  text: string;
  language: string;
  token: string | null;
  aiConfigured: boolean;
  smartSuggest: boolean;
  autoCorrect: boolean;
  onApply: (next: string) => void;
};

export function useComposeAssist({
  text,
  language,
  token,
  aiConfigured,
  smartSuggest,
  autoCorrect,
  onApply,
}: Options) {
  const [suggestion, setSuggestion] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [correcting, setCorrecting] = useState(false);

  const suggestSeq = useRef(0);
  const correctSeq = useRef(0);
  const lastCorrectedSnapshot = useRef("");

  const clearSuggestion = useCallback(() => {
    setSuggestion("");
  }, []);

  const acceptSuggestion = useCallback(() => {
    if (!suggestion) return false;
    const next = `${text}${suggestion}`;
    onApply(next);
    setSuggestion("");
    return true;
  }, [onApply, suggestion, text]);

  useEffect(() => {
    if (!token || !aiConfigured || !smartSuggest) {
      setSuggestion("");
      setSuggesting(false);
      return;
    }

    const trimmed = text.trimEnd();
    if (trimmed.length < MIN_SUGGEST_CHARS) {
      setSuggestion("");
      setSuggesting(false);
      return;
    }

    const seq = ++suggestSeq.current;
    setSuggesting(true);

    const timer = setTimeout(async () => {
      try {
        const result = await api.suggestCompletion(token, {
          content: trimmed,
          language,
        });
        if (seq !== suggestSeq.current) return;
        setSuggestion(result.suggestion?.trim() ?? "");
      } catch {
        if (seq === suggestSeq.current) setSuggestion("");
      } finally {
        if (seq === suggestSeq.current) setSuggesting(false);
      }
    }, SUGGEST_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [text, language, token, aiConfigured, smartSuggest]);

  useEffect(() => {
    if (!token || !aiConfigured || !autoCorrect) {
      setCorrecting(false);
      return;
    }

    const trimmed = text.trim();
    if (trimmed.length < MIN_CORRECT_CHARS) {
      setCorrecting(false);
      return;
    }

    if (trimmed === lastCorrectedSnapshot.current) {
      return;
    }

    const seq = ++correctSeq.current;
    setCorrecting(true);

    const timer = setTimeout(async () => {
      try {
        const snapshot = text;
        const result = await api.correctText(token, {
          content: snapshot,
          language,
        });
        if (seq !== correctSeq.current) return;
        if (result.changed && result.content !== snapshot) {
          lastCorrectedSnapshot.current = result.content.trim();
          onApply(result.content);
        }
      } catch {
        // silent — auto-correct is optional
      } finally {
        if (seq === correctSeq.current) setCorrecting(false);
      }
    }, CORRECT_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [text, language, token, aiConfigured, autoCorrect, onApply]);

  useEffect(() => {
    if (!text.trim()) {
      lastCorrectedSnapshot.current = "";
    }
  }, [text]);

  return {
    suggestion,
    suggesting,
    correcting,
    acceptSuggestion,
    clearSuggestion,
  };
}
