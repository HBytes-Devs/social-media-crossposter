import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { PageHeaderButton } from "../components/ui/PageHeaderButton";
import { PageStateLoader } from "../components/ui/PageState";
import { QuickActionCard } from "../components/dashboard/posting/QuickActionCard";
import { PlatformStatTile } from "../components/dashboard/posting/PlatformStatTile";
import { PostCard } from "../components/posts/PostCard";
import { PostsTabBar } from "../components/posts/PostsTabBar";
import { PostsPanelEmptyState } from "../components/posts/PostsPanelEmptyState";
import { useAppTokens } from "../theme/AppThemeProvider";
import { api } from "../lib/api";
import type { DashboardData, Post } from "../types";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectToken } from "../store/slices/authSlice";
import {
  cancelPostSchedule,
  fetchPostCounts,
  fetchPosts,
  permanentlyDeletePost,
  publishPostNow,
  restorePost,
  retryFailedPost,
  selectPosts,
  setActiveTab,
  trashPost,
  type PostTab,
} from "../store/slices/postsSlice";
import { PLATFORM_META, groupPostsByPlatform } from "../lib/platforms";

const HUB_PLATFORMS = ["FACEBOOK", "INSTAGRAM", "LINKEDIN"] as const;

export function PostingHubPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const tokens = useAppTokens();
  const token = useAppSelector(selectToken);
  const {
    items: posts,
    loadedTab,
    counts,
    countsLoading,
    actingOnPostId,
    success,
    error,
    activeTab,
    loading: postsLoading,
  } = useAppSelector(selectPosts);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Fetch dashboard data and post counts on mount; only fetch posts when user opens a tab.
  useEffect(() => {
    if (!token) return;
    setDashboardLoading(true);
    setDashboardError(null);
    api
      .getDashboard(token)
      .then((data) => setDashboard(data))
      .catch((err) => setDashboardError(err instanceof Error ? err.message : "Dashboard load fail"))
      .finally(() => setDashboardLoading(false));
    dispatch(fetchPostCounts());
  }, [token, dispatch]);

  // Only fetch posts when the user actively switches tabs on the hub.
  useEffect(() => {
    if (!token) return;
    if (loadedTab !== activeTab) {
      dispatch(fetchPosts());
    }
  }, [token, dispatch, activeTab, loadedTab]);

  const previewPosts = useMemo(() => posts.slice(0, 3), [posts]);
  const isInitialPostsLoad = postsLoading && loadedTab === null;
  const isTabSwitching = postsLoading && loadedTab !== null && loadedTab !== activeTab;

  const platformGroups = useMemo(() => {
    if (dashboard) {
      const source = [...dashboard.recent, ...dashboard.upcoming];
      if (source.length > 0) return groupPostsByPlatform(source);
    }
    return groupPostsByPlatform(posts);
  }, [dashboard, posts]);

  const platformTiles = HUB_PLATFORMS.map((platform) => {
    const group = platformGroups.find((g) => g.key === platform);
    const platformPosts: Post[] = group?.posts ?? [];
    const lastPostDate =
      platformPosts
        .map((p) => p.publishedAt ?? p.scheduledFor ?? p.createdAt)
        .filter(Boolean)
        .sort((a, b) => new Date(b as string).getTime() - new Date(a as string).getTime())[0] ??
      null;
    const totalCount = dashboard?.accounts.byPlatform[platform] ?? 0;
    return {
      platform,
      postCount: platformPosts.length,
      lastPostDate,
      connected: totalCount > 0,
      href: `/posts?platform=${platform}`,
      label: PLATFORM_META[platform]?.label ?? platform,
    };
  });

  function handleTabChange(tab: PostTab) {
    if (tab === activeTab) return;
    dispatch(setActiveTab(tab));
  }

  function renderPostCard(post: Post) {
    return (
      <PostCard
        key={post.id}
        post={post}
        token={token}
        acting={actingOnPostId === post.id}
        onTrash={(id) => dispatch(trashPost(id))}
        onRestore={(id) => dispatch(restorePost(id))}
        onPermanentDelete={(id) => dispatch(permanentlyDeletePost(id))}
        onPublishNow={(id) => dispatch(publishPostNow(id))}
        onCancelSchedule={(id) => dispatch(cancelPostSchedule(id))}
        onRetryFailed={(id) => dispatch(retryFailedPost(id))}
      />
    );
  }

  const isDark = tokens.cardShadow.includes("rgba(0,0,0");
  const errorToShow = dashboardError || error;

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", minWidth: 0 }}>
      <PageHeader
        title="Posting"
        subtitle="Compose, schedule, aur manage — ek hi jagah se."
        actions={
          <PageHeaderButton
            variant="primary"
            onClick={() => navigate("/compose")}
            startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
          >
            New post
          </PageHeaderButton>
        }
      />

      <Collapse in={Boolean(errorToShow)}>
        {errorToShow && (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {errorToShow}
          </Alert>
        )}
      </Collapse>

      <Collapse in={Boolean(success)}>
        {success && (
          <Alert severity="success" sx={{ mb: 2.5 }}>
            {success}
          </Alert>
        )}
      </Collapse>

      {dashboardLoading && !dashboard ? (
        <PageStateLoader label="Loading posting hub..." />
      ) : (
        <Stack spacing={2.75}>
          {/* Quick-action tiles */}
          <Box
            sx={{
              display: "grid",
              gap: 1.75,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
            }}
          >
            <QuickActionCard
              icon={<AutoAwesomeRoundedIcon />}
              title="Compose"
              subtitle="New post likho"
              count={counts.all ?? 0}
              accent="teal"
              href="/compose"
              tourId="nav-compose"
            />
            <QuickActionCard
              icon={<CalendarMonthOutlinedIcon />}
              title="Calendar"
              subtitle="Month view"
              count={counts.scheduled ?? 0}
              accent="blue"
              href="/calendar"
              tourId="nav-calendar"
            />
            <QuickActionCard
              icon={<ArticleOutlinedIcon />}
              title="Posts"
              subtitle="All, drafts, scheduled"
              count={counts.published ?? 0}
              accent="purple"
              href="/posts"
            />
            <QuickActionCard
              icon={<LinkOutlinedIcon />}
              title="Connected accounts"
              subtitle="Platforms manage karo"
              count={dashboard?.accounts.total ?? 0}
              accent="amber"
              href="/accounts"
              tourId="nav-accounts"
            />
          </Box>

          {/* Recent posts card */}
          <Card
            title="Recent posts"
            description="Latest activity across all platforms"
          >
            <Box sx={{ mt: -0.5 }}>
              <PostsTabBar
                activeTab={activeTab}
                counts={counts}
                onChange={handleTabChange}
                disabled={isTabSwitching || countsLoading}
              />

              <Box sx={{ pt: 2, pb: 1 }}>
                {isInitialPostsLoad ? (
                  <PageStateLoader label="Loading posts..." />
                ) : isTabSwitching ? (
                  <PageStateLoader label="Loading tab..." />
                ) : previewPosts.length === 0 ? (
                  <PostsPanelEmptyState
                    title="Koi post nahi"
                    description="Abhi is tab mein koi post nahi. Compose se apni pehli post banao."
                    actionLabel="Create post"
                    onAction={() => navigate("/compose")}
                  />
                ) : (
                  <Stack spacing={1.5}>
                    {previewPosts.map(renderPostCard)}
                  </Stack>
                )}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  pt: 1.5,
                  pb: 0.5,
                }}
              >
                <Button
                  onClick={() => navigate("/posts")}
                  endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 13,
                    color: tokens.accent,
                    fontFamily: tokens.fonts.body,
                    px: 1.25,
                    "&:hover": { bgcolor: tokens.accentSoft },
                  }}
                >
                  Open Posts
                </Button>
              </Box>
            </Box>
          </Card>

          {/* By-platform tiles */}
          <Card title="By platform" description="Har platform pe kya chal raha hai">
            <Box
              sx={{
                display: "grid",
                gap: 1.75,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, minmax(0, 1fr))",
                },
              }}
            >
              {platformTiles.map((tile) => (
                <PlatformStatTile
                  key={tile.platform}
                  platform={tile.platform}
                  postCount={tile.postCount}
                  lastPostDate={tile.lastPostDate}
                  connected={tile.connected}
                  href={tile.href}
                />
              ))}
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                pt: 2,
                pb: 0.5,
              }}
            >
              <Button
                component={Link}
                to="/accounts"
                endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  color: tokens.accent,
                  fontFamily: tokens.fonts.body,
                  px: 1.25,
                  "&:hover": { bgcolor: tokens.accentSoft },
                }}
              >
                Manage accounts
              </Button>
            </Box>
          </Card>

          <Box sx={{ pt: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: tokens.textTertiary,
                fontFamily: tokens.fonts.body,
                fontSize: 11.5,
              }}
            >
              {isDark ? "Dark mode active" : "Light mode active"} · Last sync{" "}
              {dashboard?.generatedAt
                ? new Date(dashboard.generatedAt).toLocaleString()
                : "—"}
            </Typography>
          </Box>
        </Stack>
      )}
    </Box>
  );
}