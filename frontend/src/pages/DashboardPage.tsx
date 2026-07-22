import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DashboardActivityPanel,
  PublishedEmptyIcon,
  ScheduleEmptyIcon,
} from "../components/dashboard/DashboardActivityPanel";
import { SendIcon3D } from "../components/ui/icons3d/DashboardIcons3D";
import { DashboardStatCard } from "../components/dashboard/DashboardStatCard";
import { dashboardFonts, useDashboardTheme } from "../components/dashboard/dashboardTheme";
import { GoogleAdsPerformancePanel } from "../components/dashboard/GoogleAdsPerformancePanel";
import { LinkedInAdsPerformancePanel } from "../components/dashboard/LinkedInAdsPerformancePanel";
import { MetaAdsPerformancePanel } from "../components/dashboard/MetaAdsPerformancePanel";
import { LinkedInPerformancePanel } from "../components/dashboard/LinkedInPerformancePanel";
import { PageHeaderButton } from "../components/ui/PageHeaderButton";
import { PageStateLoader } from "../components/ui/PageState";
import { api } from "../lib/api";
import { useAppSelector } from "../store/hooks";
import { selectAuth, selectToken } from "../store/slices/authSlice";
import type { DashboardData } from "../types";

export function DashboardPage() {
  const navigate = useNavigate();
  const token = useAppSelector(selectToken);
  const { user, loading: authLoading } = useAppSelector(selectAuth);
  const { colors } = useDashboardTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canViewAnalytics =
    user?.subscription?.tier === "MEDIUM" || user?.subscription?.tier === "PREMIUM";

  useEffect(() => {
    if (!token || authLoading) return;
    setLoading(true);
    api
      .getDashboard(token, { analytics: canViewAnalytics })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [token, authLoading, canViewAnalytics]);

  if (loading || authLoading) {
    return <PageStateLoader label="Loading dashboard..." />;
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" fontFamily={dashboardFonts.body}>
          {error ?? "Dashboard unavailable"}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        fontFamily: dashboardFonts.body,
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Topbar */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
        sx={{ mb: 3.75, width: "100%" }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: dashboardFonts.heading,
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "-0.4px",
            }}
          >
            Dashboard
          </Typography>
          <Typography
            sx={{
              color: colors.inkSoft,
              fontSize: 13.5,
              mt: 0.75,
              fontFamily: dashboardFonts.body,
            }}
          >
            Overview — accounts, scheduled posts, analytics, aur recent activity
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1.25}
          flexShrink={0}
          sx={{ ml: { xs: 0, sm: "auto" } }}
        >
          <PageHeaderButton
            variant="outlined"
            onClick={() => navigate("/calendar")}
            startIcon={<CalendarMonthOutlinedIcon sx={{ fontSize: 14 }} />}
          >
            Calendar
          </PageHeaderButton>
          <PageHeaderButton
            variant="primary"
            onClick={() => navigate("/compose")}
            startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
          >
            Compose
          </PageHeaderButton>
        </Stack>
      </Stack>

      {/* Stats */}
      <Box
        sx={{
          display: "grid",
          gap: 2.25,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          mb: 2.75,
        }}
      >
        <DashboardStatCard
          variant="accounts"
          label="Connected accounts"
          value={data.accounts.total}
          foot={
            <Link
              component="button"
              onClick={() => navigate("/accounts")}
              sx={{
                color: colors.accent,
                fontWeight: 600,
                fontSize: 12,
                textDecoration: "none",
                border: "none",
                bgcolor: "transparent",
                cursor: "pointer",
                p: 0,
                fontFamily: dashboardFonts.body,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Manage accounts →
            </Link>
          }
          onClick={() => navigate("/accounts")}
        />
        <DashboardStatCard
          variant="scheduled"
          label="Scheduled"
          value={data.posts.scheduled}
          foot={`${data.posts.scheduledNext7Days} in next 7 days`}
          onClick={() => navigate("/posts/scheduled")}
        />
        <DashboardStatCard
          variant="published"
          label="Published"
          value={data.posts.published}
          foot="All time"
          onClick={() => navigate("/posts/published")}
        />
        <DashboardStatCard
          variant="drafts"
          label="Drafts"
          value={data.posts.drafts}
          foot="Ready to schedule"
          highlighted
          onClick={() => navigate("/posts/drafts")}
        />
      </Box>

      <LinkedInPerformancePanel
        analytics={data.linkedInAnalytics}
        connectedPlatforms={data.accounts.byPlatform}
        analyticsLocked={!canViewAnalytics}
      />

      <GoogleAdsPerformancePanel
        analytics={data.googleAdsAnalytics}
        analyticsLocked={!canViewAnalytics}
      />

      <LinkedInAdsPerformancePanel
        analytics={data.linkedInAdsAnalytics}
        analyticsLocked={!canViewAnalytics}
      />

      <MetaAdsPerformancePanel
        analytics={data.metaAdsAnalytics}
        analyticsLocked={!canViewAnalytics}
      />

      {/* Two columns — minmax(0,…) prevents long post text from blowing the grid */}
      <Box
        sx={{
          display: "grid",
          gap: 2.25,
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(0, 1fr)" },
          alignItems: "stretch",
          width: "100%",
          minWidth: 0,
        }}
      >
        <Box sx={{ minWidth: 0, maxWidth: "100%" }}>
          <DashboardActivityPanel
            title="Upcoming scheduled"
            subtitle="Agle 7 din ki posts"
            viewAllHref="/posts/scheduled"
            emptyIcon={<ScheduleEmptyIcon />}
            emptyText="Koi scheduled post nahi. Compose se schedule karo."
            posts={data.upcoming}
            postMeta={(post) =>
              post.scheduledFor
                ? `Scheduled ${new Date(post.scheduledFor).toLocaleString()}`
                : "Scheduled"
            }
            onPostClick={() => navigate("/posts/scheduled")}
            actionButton={
              <Button
                fullWidth
                onClick={() => navigate("/compose")}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  borderRadius: "10px",
                  py: 1.4,
                  mt: 1.5,
                  border: "1px dashed",
                  borderColor: colors.accentBorder,
                  bgcolor: "rgba(91,95,239,0.12)",
                  color: colors.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1.25,
                  "&:hover": {
                    bgcolor: "rgba(91,95,239,0.2)",
                    borderColor: colors.accent,
                  },
                }}
              >
                <SendIcon3D size={26} />
                Schedule a post
              </Button>
            }
          />
        </Box>

        <Box sx={{ minWidth: 0, maxWidth: "100%" }}>
          <DashboardActivityPanel
            title="Recently published"
            subtitle="Latest live posts"
            viewAllHref="/posts/published"
            emptyIcon={<PublishedEmptyIcon />}
            emptyText="Abhi tak koi published post nahi."
            posts={data.recent}
            postMeta={(post) =>
              post.publishedAt
                ? `Published ${new Date(post.publishedAt).toLocaleString()}`
                : "Published"
            }
            onPostClick={() => navigate("/posts/published")}
          />
        </Box>
      </Box>

      {data.posts.failed > 0 && (
        <Box
          sx={{
            mt: 2.25,
            p: 2,
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "error.main",
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(211,47,47,0.08)" : "rgba(211,47,47,0.04)",
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ScheduleOutlinedIcon color="error" fontSize="small" />
              <Typography variant="body2" fontFamily={dashboardFonts.body}>
                {data.posts.failed} post(s) need attention (failed publish).
              </Typography>
            </Stack>
            <Button
              variant="outlined"
              onClick={() => navigate("/posts/published?status=FAILED")}
              sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px" }}
            >
              Review failed
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
