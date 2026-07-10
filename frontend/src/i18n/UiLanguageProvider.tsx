import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  isUiLocale,
  messages,
  UI_LOCALE_STORAGE_KEY,
  UI_LOCALES,
  type MessageKey,
  type UiLocale,
} from "./messages";

type UiLanguageContextValue = {
  locale: UiLocale;
  setLocale: (locale: UiLocale) => void;
  t: (key: MessageKey) => string;
  locales: typeof UI_LOCALES;
};

const UiLanguageContext = createContext<UiLanguageContextValue | null>(null);

function readStoredLocale(): UiLocale {
  try {
    const stored = localStorage.getItem(UI_LOCALE_STORAGE_KEY);
    if (stored && isUiLocale(stored)) return stored;
  } catch {
    // ignore
  }
  return "roman-ur";
}

export function UiLanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<UiLocale>(readStoredLocale);

  const setLocale = useCallback((next: UiLocale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(UI_LOCALE_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: MessageKey) => messages[locale][key] ?? messages.en[key] ?? key,
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, locales: UI_LOCALES }),
    [locale, setLocale, t],
  );

  return (
    <UiLanguageContext.Provider value={value}>{children}</UiLanguageContext.Provider>
  );
}

export function useUiLanguage() {
  const ctx = useContext(UiLanguageContext);
  if (!ctx) {
    throw new Error("useUiLanguage must be used within UiLanguageProvider");
  }
  return ctx;
}
