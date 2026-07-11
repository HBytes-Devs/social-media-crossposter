import { useMemo } from "react";
import { useAppTokens } from "../../theme/AppThemeProvider";

export function useDashboardTheme() {
  const t = useAppTokens();
  return useMemo(
    () => ({
      fonts: t.fonts,
      colors: {
        accent: t.accent,
        accent2: t.accent2,
        accentSoft: t.accentSoft,
        accentBorder: t.accentBorder,
        gold: t.gold,
        goldSoft: t.goldSoft,
        success: t.success,
        successSoft: t.successSoft,
        inkSoft: t.textSecondary,
        muted: t.muted,
        line: t.line,
        nodeDim: t.surface2,
        nodeDimText: t.textTertiary,
        surface2: t.surface2,
        highlightRing: t.accentSoft,
      },
    }),
    [t],
  );
}

export const dashboardFonts = {
  heading: "'Sora', sans-serif",
  body: "'Inter', sans-serif",
  mono: "'IBM Plex Mono', monospace",
} as const;
