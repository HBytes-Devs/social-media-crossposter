import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import RepeatOutlinedIcon from "@mui/icons-material/RepeatOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageStateLoader } from "../components/ui/PageState";
import { PageHeaderButton } from "../components/ui/PageHeaderButton";
import { PageHeader } from "../components/ui/PageHeader";
import { api } from "../lib/api";
import { useAppSelector } from "../store/hooks";
import { selectAuth, selectToken } from "../store/slices/authSlice";
import { glassPanelSx } from "../theme/glassSurface";
import { dashboardFonts } from "../components/dashboard/dashboardTheme";
import type { LinkedInAnalyticsSummary } from "../types";

// ─── Metric card ──────────────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Box
      sx={{
        ...glassPanelSx,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "16px",
        p: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "10px",
          bgcolor: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          mb: 0.5,
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontSize: 26,
          fontWeight: 700,
          fontFamily: dashboardFonts.heading,
          letterSpacing: "-0.5px",
          lineHeight: 1,
        }}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary", fontFamily: dashboardFonts.body }}>
        {label}
      </Typography>
    </Box>
  );
}

// ─── Post row ─────────────────────────────────────────────────────────────────

function PostAnalyticsRow({
  post,
  index,
}: {
  post: LinkedInAnalyticsSummary["topPosts"][number];
  index: number;
}) {
  const navigate = useNavigate();
  return (
    <Box
      onClick={() => navigate("/posts/published")}
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr auto auto auto",
        gap: 2,
        alignItems: "center",
        p: "14px 20px",
        cursor: "pointer",
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-child": { borderBottom: "none" },
        "&:hover": { bgcolor: "rgba(255,255,255,0.035)" },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.25 }}>
          <Chip
            label={`#${index + 1}`}
            size="small"
            sx={{
              height: 20,
              fontSize: 11,
              fontWeight: 700,
              bgcolor: "rgba(91,95,239,0.15)",
              color: "#8b87f5",
              border: "none",
            }}
          />
          <Typography
            sx={{
              fontSize: 13.5,
              fontWeight: 600,
              fontFamily: dashboardFonts.body,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {post.contentPreview}
          </Typography>
        </Stack>
        {post.publishedAt && (
          <Typography sx={{ fontSize: 11.5, color: "text.secondary", mt: 0.25 }}>
            {new Date(post.publishedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Typography>
        )}
        {post.error && (
          <Typography sx={{ fontSize: 11.5, color: "error.main", mt: 0.25 }}>
            {post.error}
          </Typography>
        )}
      </Box>
      <Stack direction="row" alignItems="center" gap={0.5} sx={{ minWidth: 72, justifyContent: "flex-end" }}>
        <VisibilityOutlinedIcon sx={{ fontSize: 13, color: "text.secondary" }} />
        <Typography sx={{ fontSize: 13, fontFamily: dashboardFonts.body }}>
          {post.impressions.toLocaleString()}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" gap={0.5} sx={{ minWidth: 56, justifyContent: "flex-end" }}>
        <ThumbUpOutlinedIcon sx={{ fontSize: 13, color: "text.secondary" }} />
        <Typography sx={{ fontSize: 13, fontFamily: dashboardFonts.body }}>
          {post.reactions.toLocaleString()}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" gap={0.5} sx={{ minWidth: 56, justifyContent: "flex-end" }}>
        <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 13, color: "text.secondary" }} />
        <Typography sx={{ fontSize: 13, fontFamily: dashboardFonts.body }}>
          {post.comments.toLocaleString()}
        </Typography>
      </Stack>
    </Box>
  );
}

// ─── Setup step card ──────────────────────────────────────────────────────────

function SetupStep({
  number,
  title,
  description,
  done,
  action,
}: {
  number: number;
  title: string;
  description: string;
  done?: boolean;
  action?: { label: string; onClick: () => void; external?: boolean };
}) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        p: "18px 22px",
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-child": { borderBottom: "none" },
        opacity: done ? 0.7 : 1,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: 32,
          height: 32,
          borderRadius: "50%",
          bgcolor: done ? "success.main" : "rgba(91,95,239,0.18)",
          color: done ? "#fff" : "#8b87f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 13,
          mt: 0.25,
        }}
      >
        {done ? <CheckCircleOutlinedIcon sx={{ fontSize: 18 }} /> : number}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 14, fontFamily: dashboardFonts.body, mb: 0.4 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
          {description}
        </Typography>
        {action && (
          <Button
            size="small"
            endIcon={action.external ? <OpenInNewOutlinedIcon sx={{ fontSize: 13 }} /> : undefined}
            onClick={action.onClick}
            sx={{
              mt: 1.25,
              textTransform: "none",
              fontWeight: 600,
              fontSize: 12.5,
              px: 1.5,
              py: 0.65,
              borderRadius: "8px",
              bgcolor: "rgba(91,95,239,0.12)",
              color: "#8b87f5",
              "&:hover": { bgcolor: "rgba(91,95,239,0.22)" },
            }}
          >
            {action.label}
          </Button>
        )}
      </Box>
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function LinkedInMarketingPage() {
  const token = useAppSelector(selectToken);
  const { user, loading: authLoading } = useAppSelector(selectAuth);
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<LinkedInAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const canViewAnalytics =
    user?.subscription?.tier === "MEDIUM" || user?.subscription?.tier === "PREMIUM";

  const isLinkedInConnected = analytics?.error
    ? !analytics.error.toLowerCase().includes("connect")
    : analytics !== null && !loading;

  useEffect(() => {
    if (!token || authLoading) return;
    setLoading(true);
    api
      .getDashboard(token, { analytics: true })
      .then((data) => {
        setAnalytics(data.linkedInAnalytics);
      })
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, [token, authLoading]);

  if (loading || authLoading) {
    return <PageStateLoader label="Loading LinkedIn analytics..." />;
  }

  const hasData =
    canViewAnalytics && analytics && analytics.postsWithStats > 0 && !analytics.error;

  return (
    <Box sx={{ fontFamily: dashboardFonts.body, width: "100%", minWidth: 0 }}>
      <PageHeader
        title={
          <Stack direction="row" alignItems="center" gap={1.25}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                bgcolor: "#0A66C2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUpOutlinedIcon sx={{ fontSize: 18, color: "#fff" }} />
            </Box>
            <Typography
              sx={{ fontFamily: dashboardFonts.heading, fontSize: 26, fontWeight: 700, letterSpacing: "-0.4px" }}
            >
              LinkedIn Marketing
            </Typography>
          </Stack>
        }
        subtitle="Organic post performance — impressions, reactions, comments & reach"
        actions={
          <>
            <PageHeaderButton variant="outlined" onClick={() => navigate("/posts/published")}>
              View all posts
            </PageHeaderButton>
            {!isLinkedInConnected && (
              <PageHeaderButton variant="primary" onClick={() => navigate("/accounts")}>
                Connect LinkedIn
              </PageHeaderButton>
            )}
          </>
        }
      />

      {/* Plan lock */}
      {!canViewAnalytics && (
        <Box
          sx={{
            ...glassPanelSx,
            border: "1px solid",
            borderColor: "rgba(91,95,239,0.35)",
            borderRadius: "16px",
            p: 3,
            mb: 2.25,
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <LockOutlinedIcon sx={{ color: "#8b87f5", fontSize: 28, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 600, mb: 0.4 }}>Analytics requires Medium or Premium plan</Typography>
            <Typography color="text.secondary" sx={{ fontSize: 13.5 }}>
              Upgrade to unlock LinkedIn post analytics, Google Ads, and LinkedIn Ads.
            </Typography>
          </Box>
          <PageHeaderButton variant="primary" onClick={() => navigate("/settings")}>
            Upgrade plan
          </PageHeaderButton>
        </Box>
      )}

      {/* Metrics overview */}
      {canViewAnalytics && hasData && analytics && (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", lg: "repeat(5, 1fr)" },
              gap: 2,
              mb: 2.25,
            }}
          >
            <MetricCard icon={<VisibilityOutlinedIcon />} label="Total impressions" value={analytics.totalImpressions} color="#3B82F6" />
            <MetricCard icon={<GroupOutlinedIcon />} label="Members reached" value={analytics.totalMembersReached} color="#0A66C2" />
            <MetricCard icon={<ThumbUpOutlinedIcon />} label="Total reactions" value={analytics.totalReactions} color="#10B981" />
            <MetricCard icon={<ChatBubbleOutlineOutlinedIcon />} label="Comments" value={analytics.totalComments} color="#F59E0B" />
            <MetricCard icon={<RepeatOutlinedIcon />} label="Reshares" value={analytics.totalReshares} color="#8B5CF6" />
          </Box>

          {/* Top posts table */}
          <Box
            sx={{
              ...glassPanelSx,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "16px",
              overflow: "hidden",
              mb: 2.25,
            }}
          >
            <Box sx={{ px: "20px", py: "18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ fontFamily: dashboardFonts.heading, fontWeight: 600, fontSize: 15.5 }}>
                Top performing posts
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                {analytics.postsWithStats} / {analytics.postsChecked} posts with data ·{" "}
                updated {new Date(analytics.lastFetchedAt).toLocaleString()}
              </Typography>
            </Box>
            <Divider />
            {/* Table header */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                gap: 2,
                px: "20px",
                py: "10px",
                bgcolor: "rgba(255,255,255,0.025)",
              }}
            >
              <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Post
              </Typography>
              <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 72, textAlign: "right" }}>
                Views
              </Typography>
              <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 56, textAlign: "right" }}>
                Likes
              </Typography>
              <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 56, textAlign: "right" }}>
                Comments
              </Typography>
            </Box>
            <Divider />
            {analytics.topPosts.map((post, i) => (
              <PostAnalyticsRow key={post.postId} post={post} index={i} />
            ))}
          </Box>
        </>
      )}

      {/* Setup guide — when no data yet */}
      {canViewAnalytics && !hasData && (
        <Box
          sx={{
            ...glassPanelSx,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "16px",
            overflow: "hidden",
            mb: 2.25,
          }}
        >
          <Box sx={{ px: "22px", py: "20px", bgcolor: "rgba(10,102,194,0.08)", borderBottom: "1px solid", borderColor: "divider" }}>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "#0A66C2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUpOutlinedIcon sx={{ fontSize: 20, color: "#fff" }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 15, fontFamily: dashboardFonts.heading }}>
                  Set up LinkedIn post analytics
                </Typography>
                <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.3 }}>
                  {analytics?.error ?? "Follow these steps to start tracking post performance"}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <SetupStep
            number={1}
            title="Connect your LinkedIn account"
            description="Link your LinkedIn profile in Accounts to enable cross-posting and analytics."
            done={isLinkedInConnected}
            action={
              isLinkedInConnected
                ? undefined
                : { label: "Go to Accounts", onClick: () => navigate("/accounts") }
            }
          />
          <SetupStep
            number={2}
            title="Publish posts through SMC"
            description="Analytics only work for posts published via SMC. Use Compose to post to LinkedIn."
            action={{ label: "Compose a post", onClick: () => navigate("/compose") }}
          />
          <SetupStep
            number={3}
            title="Apply for LinkedIn Community Management API"
            description="LinkedIn requires API approval before post analytics can be fetched. Apply on the LinkedIn Developer portal with your SMC app."
            action={{
              label: "LinkedIn Developer Portal",
              onClick: () => window.open("https://developer.linkedin.com", "_blank"),
              external: true,
            }}
          />
          <SetupStep
            number={4}
            title="Wait for approval & reconnect"
            description="After LinkedIn approves the Community Management API, add the r_member_postAnalytics scope and reconnect your LinkedIn account in SMC."
          />
        </Box>
      )}

      {/* Info: read-only note */}
      <Box
        sx={{
          ...glassPanelSx,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "16px",
          p: "18px 22px",
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>About LinkedIn analytics in SMC</Typography>
        <Typography color="text.secondary" sx={{ fontSize: 13.5, lineHeight: 1.7 }}>
          SMC tracks performance for posts <strong>you publish through SMC</strong>. Data is fetched live from the LinkedIn API
          (impressions, members reached, reactions, comments, reshares). Analytics are <strong>read-only</strong> — campaign
          or post management stays in LinkedIn. Metrics may take a few hours to appear after publishing.
        </Typography>
      </Box>
    </Box>
  );
}
