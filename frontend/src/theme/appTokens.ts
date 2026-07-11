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
  pageBg: "#F3F5F9",
  surface: "#FFFFFF",
  surface2: "#F8F9FC",
  panelTop: "#FFFFFF",
  panelBottom: "#F8F9FC",
  panelGradient: "linear-gradient(180deg, #FFFFFF 0%, #F8F9FC 100%)",
  border: "#E4E8F0",
  borderStrong: "#D7DCE6",
  line: "#E4E8F0",
  textPrimary: "#101828",
  textSecondary: "#66707E",
  textTertiary: "#98A2B3",
  textSoft: "#66707E",
  muted: "#98A2B3",
  ink: "#101828",
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
  inputBg: "#FFFFFF",
  disabledBg: "#F3F5F9",
  disabledText: "#98A2B3",
  chipBg: "#EBF0FF",
  codeBg: "#F3F5F9",
  codeBorder: "#E4E8F0",
  codeText: "#475467",
  manageBg: "#FFFFFF",
  manageBorder: "#D7DCE6",
  manageText: "#344054",
  cardShadow: "0 1px 2px rgba(16,24,40,0.03)",
  cardBg: "linear-gradient(180deg, #FFFFFF 0%, #F8F9FC 100%)",
  cardBorder: "#E4E8F0",
  cardBorderHover: "#2E5CFF",
  off: "#667085",
  offBg: "#F3F5F9",
  offBorder: "#E4E8F0",
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
  pageBg: "#020617",
  surface: "#14162A",
  surface2: "#1A1C31",
  panelTop: "#14152A",
  panelBottom: "#0F1020",
  panelGradient: "linear-gradient(180deg, #14162A 0%, #10111F 100%)",
  border: "#22243D",
  borderStrong: "#2A2C46",
  line: "#22243D",
  textPrimary: "#F1F1F6",
  textSecondary: "#B9BBCE",
  textTertiary: "#6E7189",
  textSoft: "#B9BBCE",
  muted: "#6E7189",
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
  inputBg: "#0C0D18",
  disabledBg: "#181A2C",
  disabledText: "#5A5C74",
  chipBg: "rgba(255,255,255,0.03)",
  codeBg: "#1A1C31",
  codeBorder: "#262842",
  codeText: "#B7B9E8",
  manageBg: "#1A1C31",
  manageBorder: "#2A2C46",
  manageText: "#C9CBDE",
  cardShadow: "none",
  cardBg: "linear-gradient(180deg, #14162A 0%, #10111F 100%)",
  cardBorder: "#22243D",
  cardBorderHover: "#2E3050",
  off: "#8B8FA3",
  offBg: "rgba(255,255,255,0.05)",
  offBorder: "#262842",
  offDot: "#5B5F78",
  linkedin: "#0A66C2",
  facebook: "#1877F2",
  twitter: "#0F1419",
  twitterBg: "#0F0F14",
  twitterBorder: "#2A2C3E",
  reddit: "#FF4500",
  previewSurface: "#14162A",
};

export function getAppTokens(mode: PaletteMode): AppTokens {
  return mode === "dark" ? darkTokens : lightTokens;
}
