/** Landing tokens aligned with app light theme (`appTokens` teal accent). */
export const landing = {
  fonts: {
    heading: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, -apple-system, sans-serif",
  },
  /** Primary accent — same as app `tokens.accent` */
  green: "#0F766E",
  greenDark: "#115E59",
  greenSoft: "#E0F2F1",
  greenBanner: "#0F766E",
  greenCta: "#CCFBF1",
  accent2: "#2DD4BF",
  accentLight: "#5EEAD4",
  ink: "#0F172A",
  muted: "#64748B",
  soft: "#94A3B8",
  line: "#E7EAF0",
  bg: "#FFFFFF",
  bgOff: "#F5F6FA",
  beige: "#F0EBE3",
  pastelPink: "#F6EAF2",
  pastelGreen: "#E0F2F1",
  pastelYellow: "#FBF3D4",
  pastelBlue: "#E4F0FB",
  pastelPurple: "#E0F2F1",
  footer: "#0B1220",
  footerAccent: "#5EEAD4",
  max: 1100,
  radius: 20,
  pill: 999,
  brandName: "SMC",
  brandTagline: "Social crossposter",
} as const;

export const wrap = {
  width: "100%",
  maxWidth: landing.max,
  mx: "auto",
  px: { xs: 2.5, sm: 3.5, md: 4 },
  boxSizing: "border-box",
  minWidth: 0,
} as const;
