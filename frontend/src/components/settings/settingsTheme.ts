import { useMemo } from "react";
import { useAppTokens } from "../../theme/AppThemeProvider";
import type { AppTokens } from "../../theme/appTokens";

export function mapSettingsColors(t: AppTokens) {
  return {
    line: t.line,
    text: t.textPrimary,
    textSoft: t.textSoft,
    muted: t.muted,
    accent: t.accent,
    accent2: t.accent2,
    accentSoft: t.accentSoft,
    accentBorder: t.accentBorder,
    accentText: t.accentText,
    accentTag: t.accentTag,
    gold: t.gold,
    goldSoft: t.goldSoft,
    goldBorder: t.goldBorder,
    success: t.success,
    successGlow: t.successGlow,
    panelTop: t.panelTop,
    panelBottom: t.panelBottom,
    inputBg: t.inputBg,
    disabledBg: t.disabledBg,
    disabledText: t.disabledText,
    chipBg: t.chipBg,
  };
}

export function buildSettingsPanelSx(t: AppTokens) {
  return {
    background: t.panelGradient,
    border: "1px solid",
    borderColor: t.line,
    borderRadius: "16px",
    px: { xs: 2, sm: "28px" },
    py: { xs: 2.5, sm: "26px" },
  } as const;
}

export function buildSettingsInputSx(t: AppTokens) {
  return {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      bgcolor: t.inputBg,
      color: t.textPrimary,
      fontSize: 14,
      fontFamily: t.fonts.body,
      "& fieldset": {
        borderColor: t.line,
      },
      "&:hover fieldset": {
        borderColor: t.line,
      },
      "&.Mui-focused fieldset": {
        borderColor: t.accent,
        boxShadow: `0 0 0 3px ${t.accentSoft}`,
      },
    },
    "& .MuiInputLabel-root": {
      display: "none",
    },
    "& .MuiFormHelperText-root": {
      fontFamily: t.fonts.body,
    },
  };
}

export function useSettingsTheme() {
  const t = useAppTokens();
  return useMemo(
    () => ({
      colors: mapSettingsColors(t),
      fonts: t.fonts,
      panelSx: buildSettingsPanelSx(t),
      inputSx: buildSettingsInputSx(t),
    }),
    [t],
  );
}
