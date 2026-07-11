import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { PLATFORM_ORDER, PLATFORM_META } from "../../lib/platforms";
import type { LinkedInAnalyticsSummary } from "../../types";
import { LinkedInStatsGrid } from "../analytics/LinkedInStatsGrid";
import { dashboardFonts, useDashboardTheme } from "./dashboardTheme";

type Props = {
  analytics: LinkedInAnalyticsSummary | null;
  connectedPlatforms: Record<string, number>;
};

function PlatformNode({
  platform,
  active,
}: {
  platform: string;
  active: boolean;
}) {
  const { colors } = useDashboardTheme();
  const meta = PLATFORM_META[platform];
  if (!meta) return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        flexShrink: 0,
        width: 92,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: platform === "REDDIT" ? 11 : 14,
          fontWeight: 700,
          fontFamily: dashboardFonts.heading,
          position: "relative",
          zIndex: 2,
          bgcolor: active ? meta.color : colors.nodeDim,
          color: active ? "#fff" : colors.nodeDimText,
          ...(active
            ? {
                boxShadow: "0 0 0 5px #EEEEFD, 0 8px 18px -6px rgba(91,95,239,0.5)",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  inset: -8,
                  borderRadius: "50%",
                  border: "1.5px solid",
                  borderColor: colors.accent,
                  animation: "smc-pulse-ring 2.4s ease-out infinite",
                },
                "@keyframes smc-pulse-ring": {
                  "0%": { transform: "scale(0.85)", opacity: 0.7 },
                  "80%": { transform: "scale(1.35)", opacity: 0 },
                  "100%": { opacity: 0 },
                },
              }
            : {}),
        }}
      >
        {meta.icon}
      </Box>
      <Typography
        sx={{
          fontSize: 10.5,
          color: colors.inkSoft,
          fontWeight: 500,
          fontFamily: dashboardFonts.body,
          textAlign: "center",
        }}
      >
        {meta.label}
      </Typography>
    </Box>
  );
}

function Connector() {
  return (
    <Box
      sx={{
        flex: 1,
        height: 1.5,
        minWidth: 34,
        mb: 3.25,
        background:
          "repeating-linear-gradient(90deg, #E7E8F1 0 6px, transparent 6px 12px)",
      }}
    />
  );
}

export function LinkedInPerformancePanel({ analytics, connectedPlatforms }: Props) {
  const navigate = useNavigate();
  const { colors } = useDashboardTheme();
  const hasAnalytics =
    analytics && analytics.postsWithStats > 0 && !analytics.error;
  const needsConnect =
    !hasAnalytics &&
    (!analytics ||
      Boolean(analytics.error) ||
      (connectedPlatforms.LINKEDIN ?? 0) === 0);

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "16px",
        p: "24px 26px",
        mb: 2.25,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2.5,
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: dashboardFonts.heading,
              fontSize: 16.5,
              fontWeight: 600,
            }}
          >
            LinkedIn performance
          </Typography>
          <Typography
            sx={{
              fontSize: 12.5,
              color: colors.inkSoft,
              mt: 0.5,
              fontFamily: dashboardFonts.body,
            }}
          >
            Last 5 published posts — live from LinkedIn API
          </Typography>
        </Box>
        {hasAnalytics && (
          <Link
            component={RouterLink}
            to="/posts/published"
            underline="hover"
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: colors.accent,
              fontFamily: dashboardFonts.body,
            }}
          >
            All posts →
          </Link>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          px: 1.25,
          pt: 2.75,
          pb: 0.75,
          overflowX: "auto",
        }}
      >
        {PLATFORM_ORDER.map((platform, index) => (
          <Box
            key={platform}
            sx={{
              display: "flex",
              alignItems: "center",
              flex: index < PLATFORM_ORDER.length - 1 ? 1 : undefined,
            }}
          >
            <PlatformNode
              platform={platform}
              active={
                platform === "LINKEDIN"
                  ? (connectedPlatforms.LINKEDIN ?? 0) > 0 || Boolean(hasAnalytics)
                  : (connectedPlatforms[platform] ?? 0) > 0
              }
            />
            {index < PLATFORM_ORDER.length - 1 && <Connector />}
          </Box>
        ))}
      </Box>

      {hasAnalytics && analytics && (
        <Box sx={{ mt: 2 }}>
          <LinkedInStatsGrid
            stats={{
              impressions: analytics.totalImpressions,
              membersReached: analytics.totalMembersReached,
              reactions: analytics.totalReactions,
              comments: analytics.totalComments,
              reshares: analytics.totalReshares,
            }}
            compact
          />
          {analytics.topPosts.length > 0 && (
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
              {analytics.topPosts.slice(0, 3).map((post) => (
                <Box
                  key={post.postId}
                  onClick={() => navigate("/posts/published")}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    cursor: "pointer",
                    "&:hover": { borderColor: colors.accent },
                  }}
                >
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {post.contentPreview}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {post.error
                      ? post.error
                      : `${post.impressions.toLocaleString()} impressions · ${post.reactions.toLocaleString()} reactions`}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1.5, fontFamily: dashboardFonts.body }}
          >
            Updated {new Date(analytics.lastFetchedAt).toLocaleString()} ·{" "}
            {analytics.postsWithStats}/{analytics.postsChecked} posts with stats
          </Typography>
        </Box>
      )}

      {needsConnect && (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            background: "linear-gradient(90deg, #EEEEFD, #F7F5FE)",
            border: "1px solid",
            borderColor: colors.accentBorder,
            borderRadius: "12px",
            p: "14px 18px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <BoltOutlinedIcon sx={{ color: colors.accent, fontSize: 18 }} />
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 500,
                color: "#3C3E63",
                fontFamily: dashboardFonts.body,
              }}
            >
              {analytics?.error ?? "Connect LinkedIn on Accounts page to see analytics"}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate("/accounts")}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: 12.5,
              px: 1.75,
              py: 1,
              borderRadius: "10px",
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`,
              boxShadow: "none",
              "&:hover": {
                boxShadow: "0 10px 24px -8px rgba(91,95,239,0.55)",
              },
            }}
          >
            Connect account
          </Button>
        </Box>
      )}
    </Box>
  );
}
