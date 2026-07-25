import type { PaletteMode } from "@mui/material";

export const appFonts = {
  heading: "'Plus Jakarta Sans', 'Sora', sans-serif",
  body: "'Inter', sans-serif",
  mono: "'IBM Plex Mono', monospace",
} as const;

export type AppTokens = {
  fonts: typeof appFonts;
  pageBg: string;
  surface: string;
  surface2: string;
  panelTop: string;
  panelBottom: string;
  panelGradient: string;
  border: string;
  borderStrong: string;
  line: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textSoft: string;
  muted: string;
  ink: string;
  accent: string;
  accent2: string;
  accentSoft: string;
  accentBorder: string;
  accentDark: string;
  accentText: string;
  accentTag: string;
  success: string;
  successSoft: string;
  successGlow: string;
  danger: string;
  warn: string;
  warnBg: string;
  warnBorder: string;
  gold: string;
  goldSoft: string;
  goldBorder: string;
  inputBg: string;
  disabledBg: string;
  disabledText: string;
  chipBg: string;
  codeBg: string;
  codeBorder: string;
  codeText: string;
  manageBg: string;
  manageBorder: string;
  manageText: string;
  cardShadow: string;
  cardBg: string;
  cardBorder: string;
  cardBorderHover: string;
  off: string;
  offBg: string;
  offBorder: string;
  offDot: string;
  linkedin: string;
  facebook: string;
  twitter: string;
  twitterBg: string;
  twitterBorder: string;
  reddit: string;
  previewSurface: string;
};

const lightTokens: AppTokens = {
  fonts: appFonts,
  pageBg: "#F5F6FA",
  surface: "#FFFFFF",
  surface2: "#F8F9FC",
  panelTop: "#FFFFFF",
  panelBottom: "#F8F9FC",
  panelGradient: "linear-gradient(180deg, #FFFFFF 0%, #F8F9FC 100%)",
  border: "#E7EAF0",
  borderStrong: "#D7DCE6",
  line: "#E7EAF0",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textTertiary: "#94A3B8",
  textSoft: "#64748B",
  muted: "#94A3B8",
  ink: "#0F172A",
  accent: "#2E5CFF",
  accent2: "#5B5FEF",
  accentSoft: "#EBF0FF",
  accentBorder: "#C7D7FF",
  accentDark: "#101828",
  accentText: "#2E5CFF",
  accentTag: "#2E5CFF",
  success: "#12B76A",
  successSoft: "#E7F9F1",
  successGlow: "rgba(18,183,106,0.15)",
  danger: "#F04438",
  warn: "#E6A42D",
  warnBg: "rgba(230,164,45,0.1)",
  warnBorder: "rgba(230,164,45,0.25)",
  gold: "#C7A24B",
  goldSoft: "#FDF3E3",
  goldBorder: "rgba(199,162,75,0.35)",
  inputBg: "#F3F4F8",
  disabledBg: "#F3F5F9",
  disabledText: "#98A2B3",
  chipBg: "#EBF0FF",
  codeBg: "#F3F5F9",
  codeBorder: "#E7EAF0",
  codeText: "#475467",
  manageBg: "#FFFFFF",
  manageBorder: "#D7DCE6",
  manageText: "#344054",
  cardShadow: "0 8px 28px rgba(15, 23, 42, 0.05)",
  cardBg: "linear-gradient(180deg, #FFFFFF 0%, #F8F9FC 100%)",
  cardBorder: "#E7EAF0",
  cardBorderHover: "#2E5CFF",
  off: "#667085",
  offBg: "#F3F5F9",
  offBorder: "#E7EAF0",
  offDot: "#98A2B3",
  linkedin: "#0A66C2",
  facebook: "#1877F2",
  twitter: "#0F1419",
  twitterBg: "#F3F5F9",
  twitterBorder: "#D7DCE6",
  reddit: "#FF4500",
  previewSurface: "#FFFFFF",
};

const darkTokens: AppTokens = {
  fonts: appFonts,
  pageBg: "#0B0D12",
  surface: "#161A22",
  surface2: "#1B1F27",
  panelTop: "#161A22",
  panelBottom: "#12151C",
  panelGradient: "linear-gradient(180deg, #161A22 0%, #12151C 100%)",
  border: "#2A303C",
  borderStrong: "#343B4A",
  line: "#2A303C",
  textPrimary: "#F5F7FA",
  textSecondary: "#B4BBC9",
  textTertiary: "#8B93A7",
  textSoft: "#B4BBC9",
  muted: "#8B93A7",
  ink: "#FFFFFF",
  accent: "#5B5FEF",
  accent2: "#8A6DF1",
  accentSoft: "rgba(91,95,239,0.12)",
  accentBorder: "rgba(91,95,239,0.3)",
  accentDark: "#101828",
  accentText: "#C9CAF5",
  accentTag: "#9FA2F7",
  success: "#2CC08C",
  successSoft: "rgba(31,169,122,0.12)",
  successGlow: "rgba(44,192,140,0.18)",
  danger: "#F04438",
  warn: "#E6A42D",
  warnBg: "rgba(230,164,45,0.12)",
  warnBorder: "rgba(230,164,45,0.3)",
  gold: "#E6A42D",
  goldSoft: "rgba(230,164,45,0.1)",
  goldBorder: "rgba(230,164,45,0.3)",
  inputBg: "#1B1F27",
  disabledBg: "#12151C",
  disabledText: "#5A5C74",
  chipBg: "rgba(255,255,255,0.04)",
  codeBg: "#1B1F27",
  codeBorder: "#2A303C",
  codeText: "#B7B9E8",
  manageBg: "#1B1F27",
  manageBorder: "#2A303C",
  manageText: "#C9CBDE",
  cardShadow: "0 12px 40px rgba(0,0,0,0.35)",
  cardBg: "linear-gradient(180deg, #161A22 0%, #12151C 100%)",
  cardBorder: "#2A303C",
  cardBorderHover: "#3A4252",
  off: "#8B8FA3",
  offBg: "rgba(255,255,255,0.05)",
  offBorder: "#2A303C",
  offDot: "#5B5F78",
  linkedin: "#0A66C2",
  facebook: "#1877F2",
  twitter: "#0F1419",
  twitterBg: "#12151C",
  twitterBorder: "#2A303C",
  reddit: "#FF4500",
  previewSurface: "#161A22",
};

export function getAppTokens(mode: PaletteMode): AppTokens {
  return mode === "dark" ? darkTokens : lightTokens;
}
