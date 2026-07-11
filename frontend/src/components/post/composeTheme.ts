import { useMemo } from "react";
import { useAppTokens } from "../../theme/AppThemeProvider";
import type { AppTokens } from "../../theme/appTokens";

export const composeFonts = {
  heading: "'Plus Jakarta Sans', 'Sora', sans-serif",
  body: "'Inter', sans-serif",
  mono: "'IBM Plex Mono', monospace",
} as const;

/** @deprecated Use useComposeTheme() for mode-aware colors */
export const composeColors = {
  bg: "#F3F5F9",
  surface: "#FFFFFF",
  surface2: "#F8F9FC",
  border: "#E4E8F0",
  borderStrong: "#D7DCE6",
  textPrimary: "#101828",
  textSecondary: "#66707E",
  textTertiary: "#98A2B3",
  accent: "#2E5CFF",
  accentSoft: "#EBF0FF",
  accentDark: "#101828",
  success: "#12B76A",
  successSoft: "#E7F9F1",
  danger: "#F04438",
  linkedin: "#0A66C2",
  facebook: "#1877F2",
  twitter: "#0F1419",
  reddit: "#FF4500",
} as const;

export function useComposeTheme() {
  const t = useAppTokens();
  return useMemo(
    () => ({
      colors: mapComposeColors(t),
      fonts: t.fonts,
      cardSx: composeCardSx(t),
      fieldLabelSx: composeFieldLabelSx(t),
      selectSx: composeSelectSx(t),
    }),
    [t],
  );
}

export function mapComposeColors(t: AppTokens) {
  return {
    bg: t.pageBg,
    surface: t.surface,
    surface2: t.surface2,
    border: t.border,
    borderStrong: t.borderStrong,
    textPrimary: t.textPrimary,
    textSecondary: t.textSecondary,
    textTertiary: t.textTertiary,
    accent: t.accent,
    accentSoft: t.accentSoft,
    accentDark: t.accentDark,
    success: t.success,
    successSoft: t.successSoft,
    danger: t.danger,
    linkedin: t.linkedin,
    facebook: t.facebook,
    twitter: t.twitter,
    reddit: t.reddit,
    previewSurface: t.previewSurface,
  };
}

export function composeCardSx(t: AppTokens) {
  return {
    bgcolor: t.surface,
    border: "1px solid",
    borderColor: t.border,
    borderRadius: "16px",
    p: "22px",
    mb: "18px",
    boxShadow: t.cardShadow,
  } as const;
}

export function composeFieldLabelSx(t: AppTokens) {
  return {
    fontSize: 12,
    fontWeight: 600,
    color: t.textSecondary,
    display: "block",
    mb: "6px",
    fontFamily: t.fonts.body,
  };
}

export function composeSelectSx(t: AppTokens) {
  return {
    width: "100%",
    border: "1px solid",
    borderColor: t.borderStrong,
    borderRadius: "8px",
    p: "11px 12px",
    fontSize: 13.5,
    fontFamily: t.fonts.body,
    bgcolor: t.inputBg,
    color: t.textPrimary,
    outline: "none",
    "&:focus": {
      borderColor: t.accent,
      boxShadow: `0 0 0 3px ${t.accentSoft}`,
    },
  };
}
