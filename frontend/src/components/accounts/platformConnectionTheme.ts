import { useMemo } from "react";
import { useAppTokens } from "../../theme/AppThemeProvider";
import type { AppTokens } from "../../theme/appTokens";

export function mapPlatformColors(t: AppTokens) {
  return {
    cardBg: t.cardBg,
    cardBorder: t.cardBorder,
    cardBorderHover: t.cardBorderHover,
    ink: t.ink,
    desc: t.textSecondary,
    hint: t.textTertiary,
    codeBg: t.codeBg,
    codeBorder: t.codeBorder,
    codeText: t.codeText,
    warn: t.warn,
    warnBg: t.warnBg,
    warnBorder: t.warnBorder,
    ok: t.success,
    okBg: t.successSoft,
    okBorder: t.successGlow,
    off: t.off,
    offBg: t.offBg,
    offBorder: t.offBorder,
    offDot: t.offDot,
    accent: t.accent,
    accent2: t.accent2,
    manageBg: t.manageBg,
    manageBorder: t.manageBorder,
    manageText: t.manageText,
    linkedin: t.linkedin,
    facebook: t.facebook,
    reddit: t.reddit,
    twitterBg: t.twitterBg,
    twitterBorder: t.twitterBorder,
  };
}

export function buildPlatformAvatarSx(t: AppTokens) {
  const c = mapPlatformColors(t);
  return {
    LINKEDIN: { bgcolor: c.linkedin },
    INSTAGRAM: {
      background:
        "linear-gradient(135deg,#4F5BD5 0%, #962FBF 35%, #D62976 62%, #FA7E1E 82%, #FEDA75 100%)",
    },
    FACEBOOK: { bgcolor: c.facebook },
    TWITTER: {
      bgcolor: c.twitterBg,
      border: "1px solid",
      borderColor: c.twitterBorder,
    },
    REDDIT: { bgcolor: c.reddit },
  } as const;
}

export function usePlatformTheme() {
  const t = useAppTokens();
  return useMemo(
    () => ({
      colors: mapPlatformColors(t),
      fonts: t.fonts,
      avatarSx: buildPlatformAvatarSx(t),
    }),
    [t],
  );
}

export const platformFonts = {
  heading: "'Sora', sans-serif",
  body: "'Inter', sans-serif",
  mono: "'IBM Plex Mono', monospace",
} as const;
