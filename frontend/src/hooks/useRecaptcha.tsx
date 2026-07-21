import { useCallback, useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import { useUiLanguage } from "../i18n/UiLanguageProvider";

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

type Grecaptcha = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadRecaptchaScript(): Promise<void> {
  if (!SITE_KEY) {
    return Promise.resolve();
  }

  if (window.grecaptcha?.execute) {
    return Promise.resolve();
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="google.com/recaptcha/api.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("reCAPTCHA script failed")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("reCAPTCHA script failed"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function useRecaptcha(action: string, enabled: boolean) {
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!enabled || !SITE_KEY) {
      setReady(false);
      setLoadError(false);
      return;
    }

    let cancelled = false;

    loadRecaptchaScript()
      .then(() => {
        if (cancelled) return;
        window.grecaptcha?.ready(() => {
          if (!cancelled) setReady(true);
        });
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, action]);

  const execute = useCallback(async (): Promise<string | undefined> => {
    if (!enabled || !SITE_KEY) {
      return undefined;
    }

    if (loadError) {
      throw new Error("reCAPTCHA failed to load. Check your site key or try again.");
    }

    await loadRecaptchaScript();

    return new Promise((resolve, reject) => {
      window.grecaptcha?.ready(() => {
        window.grecaptcha
          ?.execute(SITE_KEY, { action })
          .then(resolve)
          .catch(() => reject(new Error("reCAPTCHA verification failed")));
      });
    });
  }, [enabled, action, loadError]);

  return { ready, loadError, execute, enabled: enabled && Boolean(SITE_KEY) };
}

export function RecaptchaNotice({ enabled }: { enabled: boolean }) {
  const { t } = useUiLanguage();
  if (!enabled) return null;

  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ textAlign: "center", display: "block" }}
    >
      {t("auth.recaptcha.notice")}
    </Typography>
  );
}
