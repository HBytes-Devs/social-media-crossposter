import type { SxProps, Theme } from "@mui/material/styles";
import { useMemo } from "react";
import { useThemeMode } from "../../../theme/AppThemeProvider";

export type AnalyticsPalette = {
  mode: "light" | "dark";
  purple: string;
  purpleSoft: string;
  purpleDeep: string;
  cyan: string;
  blue: string;
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  pageBg: string;
  cardBg: string;
  text: string;
  textMuted: string;
  textSoft: string;
  border: string;
  inputBg: string;
  shadow: string;
  radius: string;
  font: string;
  gridLine: string;
  chipBg: string;
};

const shared = {
  purple: "#0F766E",
  purpleDeep: "#115E59",
  cyan: "#5EEAD4",
  blue: "#2DD4BF",
  success: "#22C55E",
  danger: "#EF4444",
  radius: "16px",
  font: "'Inter', 'Plus Jakarta Sans', sans-serif",
} as const;

const light: AnalyticsPalette = {
  mode: "light",
  ...shared,
  purpleSoft: "rgba(15, 118, 110, 0.12)",
  successSoft: "rgba(34, 197, 94, 0.12)",
  dangerSoft: "rgba(239, 68, 68, 0.12)",
  pageBg: "#F5F6FA",
  cardBg: "#FFFFFF",
  text: "#0F172A",
  textMuted: "#94A3B8",
  textSoft: "#64748B",
  border: "#E7EAF0",
  inputBg: "#F3F4F8",
  shadow: "0 8px 28px rgba(15, 23, 42, 0.05)",
  gridLine: "#E8EBF2",
  chipBg: "#F3F4F8",
};

const dark: AnalyticsPalette = {
  mode: "dark",
  ...shared,
  purpleSoft: "rgba(94, 234, 212, 0.18)",
  successSoft: "rgba(34, 197, 94, 0.16)",
  dangerSoft: "rgba(239, 68, 68, 0.16)",
  // Match sidebar charcoal pill
  pageBg: "#0B0D12",
  cardBg: "#161A22",
  text: "#F5F7FA",
  textMuted: "#8B93A7",
  textSoft: "#B4BBC9",
  border: "#2A303C",
  inputBg: "#1B1F27",
  shadow: "0 12px 40px rgba(0, 0, 0, 0.35)",
  gridLine: "#2A303C",
  chipBg: "#1B1F27",
};

export function useAnalyticsTheme() {
  const { mode } = useThemeMode();
  return useMemo(() => (mode === "dark" ? dark : light), [mode]);
}

export function cardSx(a: AnalyticsPalette): SxProps<Theme> {
  return {
    bgcolor: a.cardBg,
    borderRadius: a.radius,
    boxShadow: a.shadow,
    border: `1px solid ${a.border}`,
    color: a.text,
    transition: "background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
  };
}

/** @deprecated Prefer useAnalyticsTheme() — kept for any leftover static refs */
export const analytics = light;
