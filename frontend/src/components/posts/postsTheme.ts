import { useMemo } from "react";
import { useAppTokens } from "../../theme/AppThemeProvider";
import { buildSettingsPanelSx, mapSettingsColors } from "../settings/settingsTheme";

export function usePostsTheme() {
  const t = useAppTokens();
  return useMemo(() => {
    const colors = mapSettingsColors(t);
    return {
      colors,
      fonts: t.fonts,
      containerSx: {
        ...buildSettingsPanelSx(t),
        overflow: "hidden",
        width: "100%",
      },
      filterLabelSx: {
        fontSize: 10.5,
        letterSpacing: "1.2px",
        color: colors.muted,
        fontWeight: 600,
        mb: 1.25,
        mt: 0.75,
        fontFamily: t.fonts.body,
        textTransform: "uppercase" as const,
      },
      selectSx: {
        width: "100%",
        appearance: "none",
        WebkitAppearance: "none",
        padding: "11px 34px 11px 14px",
        borderRadius: "10px",
        bgcolor: t.inputBg,
        border: "1px solid",
        borderColor: t.line,
        color: colors.textSoft,
        fontSize: 13,
        fontFamily: t.fonts.body,
        cursor: "pointer",
        outline: "none",
        "&:focus": {
          borderColor: t.accent,
          boxShadow: `0 0 0 3px ${t.accentSoft}`,
        },
      },
    };
  }, [t]);
}
