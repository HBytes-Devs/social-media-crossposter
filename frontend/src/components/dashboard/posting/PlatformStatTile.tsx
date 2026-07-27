import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import type { ReactNode } from "react";
import { useAppTokens } from "../../../theme/AppThemeProvider";

export type PlatformStatPlatform = "FACEBOOK" | "INSTAGRAM" | "LINKEDIN";

type Props = {
  platform: PlatformStatPlatform;
  postCount: number;
  lastPostDate: string | null;
  connected: boolean;
  href: string;
};

function timeAgo(iso: string | null): string {
  if (!iso) return "Koi post nahi";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Koi post nahi";
  const diffMs = Date.now() - then;
  if (diffMs < 0) {
    const future = new Date(iso).toLocaleDateString();
    return `Scheduled · ${future}`;
  }
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Abhi";
  if (minutes < 60) return `${minutes} min pehle`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ghante pehle`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} din pehle`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} hafte pehle`;
  return new Date(iso).toLocaleDateString();
}

const PLATFORM_INFO: Record<
  PlatformStatPlatform,
  { label: string; color: string; icon: ReactNode }
> = {
  FACEBOOK: { label: "Facebook", color: "#1877F2", icon: <FacebookIcon sx={{ fontSize: 22 }} /> },
  INSTAGRAM: { label: "Instagram", color: "#E4405F", icon: <InstagramIcon sx={{ fontSize: 22 }} /> },
  LINKEDIN: { label: "LinkedIn", color: "#0A66C2", icon: <LinkedInIcon sx={{ fontSize: 22 }} /> },
};

export function PlatformStatTile({ platform, postCount, lastPostDate, connected, href }: Props) {
  const theme = useTheme();
  const tokens = useAppTokens();
  const isDark = theme.palette.mode === "dark";
  const info = PLATFORM_INFO[platform];

  return (
    <Link
      to={href}
      style={{ textDecoration: "none", color: "inherit", display: "block", flex: 1, minWidth: 0 }}
    >
      <Box
        sx={{
          position: "relative",
          height: "100%",
          p: 2,
          borderRadius: "14px",
          border: "1px solid",
          borderColor: tokens.line,
          bgcolor: tokens.panelTop,
          boxShadow: isDark ? tokens.cardShadow : "0 8px 28px rgba(15, 23, 42, 0.05)",
          transition:
            "transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
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
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              color: info.color,
              bgcolor: isDark
                ? `${info.color}33`
                : `${info.color}1F`,
            }}
          >
            {info.icon}
          </Box>
          <Typography
            sx={{
              fontFamily: tokens.fonts.heading,
              fontSize: 13,
              fontWeight: 600,
              color: tokens.textPrimary,
              letterSpacing: "-0.1px",
              flex: 1,
              minWidth: 0,
            }}
          >
            {info.label}
          </Typography>
          <Box
            aria-label={connected ? "Connected" : "Not connected"}
            title={connected ? "Account connected" : "No account connected"}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              flexShrink: 0,
              bgcolor: connected ? tokens.success : tokens.offDot,
              boxShadow: connected ? `0 0 0 4px ${tokens.successGlow}` : "none",
            }}
          />
        </Stack>

        <Typography
          sx={{
            fontFamily: tokens.fonts.mono,
            fontSize: 26,
            fontWeight: 700,
            color: tokens.textPrimary,
            lineHeight: 1.1,
            letterSpacing: "-0.5px",
          }}
        >
          {postCount}
        </Typography>

        <Typography
          sx={{
            fontFamily: tokens.fonts.body,
            fontSize: 11.5,
            fontWeight: 500,
            color: tokens.textSecondary,
            lineHeight: 1.4,
          }}
        >
          {postCount === 0
            ? "Koi post nahi"
            : postCount === 1
              ? `1 post · ${timeAgo(lastPostDate)}`
              : `${postCount} posts · Last ${timeAgo(lastPostDate)}`}
        </Typography>
      </Box>
    </Link>
  );
}