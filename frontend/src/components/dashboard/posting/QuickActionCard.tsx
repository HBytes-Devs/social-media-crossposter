import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAppTokens } from "../../../theme/AppThemeProvider";

export type QuickActionAccent = "teal" | "blue" | "purple" | "amber";

type Props = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  count?: number | string;
  accent?: QuickActionAccent;
  href: string;
  tourId?: string;
};

const ACCENT_FILL: Record<QuickActionAccent, { bg: (theme: string) => string; color: string }> = {
  teal: {
    bg: (mode) => (mode === "dark" ? "rgba(94, 234, 212, 0.18)" : "rgba(15, 118, 110, 0.12)"),
    color: "#0F766E",
  },
  blue: {
    bg: (mode) => (mode === "dark" ? "rgba(56, 189, 248, 0.18)" : "rgba(2, 132, 199, 0.12)"),
    color: "#0284C7",
  },
  purple: {
    bg: (mode) => (mode === "dark" ? "rgba(167, 139, 250, 0.18)" : "rgba(109, 40, 217, 0.12)"),
    color: "#6D28D9",
  },
  amber: {
    bg: (mode) => (mode === "dark" ? "rgba(251, 191, 36, 0.18)" : "rgba(217, 119, 6, 0.14)"),
    color: "#D97706",
  },
};

export function QuickActionCard({
  icon,
  title,
  subtitle,
  count,
  accent = "teal",
  href,
  tourId,
}: Props) {
  const theme = useTheme();
  const tokens = useAppTokens();
  const isDark = theme.palette.mode === "dark";
  const accentPalette = ACCENT_FILL[accent];

  return (
    <Link
      to={href}
      data-tour={tourId}
      style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}
    >
      <Box
        sx={{
          position: "relative",
          height: "100%",
          p: 2.25,
          borderRadius: "16px",
          border: "1px solid",
          borderColor: tokens.line,
          bgcolor: tokens.panelTop,
          boxShadow: isDark ? tokens.cardShadow : "0 8px 28px rgba(15, 23, 42, 0.05)",
          transition:
            "transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease",
          cursor: "pointer",
          display: "flex",
          alignItems: "stretch",
          "&:hover": {
            transform: "translateY(-2px)",
            borderColor: tokens.accentBorder,
            boxShadow: isDark
              ? "0 18px 50px rgba(0,0,0,0.45)"
              : "0 14px 36px rgba(15, 23, 42, 0.08)",
          },
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: tokens.accent,
            outlineOffset: 2,
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.75} sx={{ width: "100%" }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              bgcolor: accentPalette.bg(isDark ? "dark" : "light"),
              color: accentPalette.color,
              "& svg": { fontSize: 22 },
            }}
          >
            {icon}
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontFamily: tokens.fonts.heading,
                fontSize: 14,
                fontWeight: 600,
                color: tokens.textPrimary,
                lineHeight: 1.3,
                letterSpacing: "-0.1px",
              }}
            >
              {title}
            </Typography>
            {subtitle ? (
              <Typography
                sx={{
                  fontFamily: tokens.fonts.body,
                  fontSize: 12,
                  fontWeight: 500,
                  color: tokens.textSecondary,
                  lineHeight: 1.4,
                  mt: 0.25,
                }}
              >
                {subtitle}
              </Typography>
            ) : null}
          </Box>

          {count !== undefined ? (
            <Box
              sx={{
                fontFamily: tokens.fonts.mono,
                fontSize: 11,
                fontWeight: 700,
                color: tokens.accent,
                bgcolor: alpha(tokens.accent, isDark ? 0.18 : 0.1),
                px: 0.9,
                py: 0.35,
                borderRadius: "999px",
                flexShrink: 0,
                lineHeight: 1.4,
              }}
            >
              {count}
            </Box>
          ) : null}
        </Stack>
      </Box>
    </Link>
  );
}