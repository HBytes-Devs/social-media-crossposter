import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { PLATFORM_ORDER, PLATFORM_META } from "../../lib/platforms";
import type { LinkedInAnalyticsSummary } from "../../types";
import { LinkedInStatsGrid } from "../analytics/LinkedInStatsGrid";
import { BoltIcon3D, PlatformPedestal3D } from "../ui/icons3d/DashboardIcons3D";
import { glassPanelSx } from "../../theme/glassSurface";
import { dashboardFonts, useDashboardTheme } from "./dashboardTheme";
type Props = {
  analytics: LinkedInAnalyticsSummary | null;
  connectedPlatforms: Record<string, number>;
  analyticsLocked?: boolean;
};

function Connector() {  return (
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

export function LinkedInPerformancePanel({
  analytics,
  connectedPlatforms,
  analyticsLocked = false,
}: Props) {
  const navigate = useNavigate();
  const { colors } = useDashboardTheme();
  const hasAnalytics =
    !analyticsLocked &&
    analytics &&
    analytics.postsWithStats > 0 &&
    !analytics.error;
  const needsConnect =
    !analyticsLocked &&
    !hasAnalytics &&
    (!analytics ||
      Boolean(analytics.error) ||
      (connectedPlatforms.LINKEDIN ?? 0) === 0);

  return (
    <Box
      sx={{
        ...glassPanelSx,
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
            <PlatformPedestal3D
              platform={platform}
              active={
                platform === "LINKEDIN"
                  ? (connectedPlatforms.LINKEDIN ?? 0) > 0 || Boolean(hasAnalytics)
                  : (connectedPlatforms[platform] ?? 0) > 0
              }
              label={PLATFORM_META[platform]?.label ?? platform}
            />            {index < PLATFORM_ORDER.length - 1 && <Connector />}
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

      {analyticsLocked && (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            bgcolor: "rgba(91,95,239,0.12)",
            border: "1px solid",
            borderColor: colors.accentBorder,
            borderRadius: "12px",
            p: "14px 18px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <BoltIcon3D size={38} />
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 500,
                color: "text.primary",
                fontFamily: dashboardFonts.body,
              }}
            >
              LinkedIn analytics Medium ya Premium plan par available hai
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate("/settings")}
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
            Upgrade plan
          </Button>
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
            bgcolor: "rgba(91,95,239,0.12)",
            border: "1px solid",
            borderColor: colors.accentBorder,
            borderRadius: "12px",
            p: "14px 18px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <BoltIcon3D size={38} />
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 500,
                color: "text.primary",
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
