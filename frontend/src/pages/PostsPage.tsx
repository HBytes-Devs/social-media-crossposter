import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PostCard } from "../components/posts/PostCard";
import { PostsFilterSelects } from "../components/posts/PostsFilterSelects";
import { PostsPageHeader } from "../components/posts/PostsPageHeader";
import { PostsPanelEmptyState } from "../components/posts/PostsPanelEmptyState";
import { PostsPlatformFilter } from "../components/posts/PostsPlatformFilter";
import { PostsPlatformSection } from "../components/posts/PostsPlatformSection";
import { PostsTabBar } from "../components/posts/PostsTabBar";
import { usePostsTheme } from "../components/posts/postsTheme";
import { PostCardSkeleton } from "../components/ui/Skeleton";
import { PageStateLoader } from "../components/ui/PageState";
import { groupPostsByPlatform } from "../lib/platforms";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectToken } from "../store/slices/authSlice";
import { DEFAULT_POST_OPTIONS } from "../store/constants";
import {
  clearPostFilters,
  clearPostsError,
  clearPostsSuccess,
  cancelPostSchedule,
  fetchPostCounts,
  fetchPosts,
  isPostTab,
  permanentlyDeletePost,
  publishPostNow,
  restorePost,
  retryFailedPost,
  selectPosts,
  setActiveTab,
  setPostFilters,
  trashPost,
  type PostTab,
} from "../store/slices/postsSlice";

const EMPTY_BY_TAB: Record<
  PostTab,
  { title: string; description: string; actionLabel: string }
> = {
  all: {
    title: "No posts yet",
    description: "Abhi koi post nahi. Compose se apni pehli post banao.",
    actionLabel: "Create post",
  },
  published: {
    title: "No published posts",
    description: "Abhi tak koi post publish nahi hui.",
    actionLabel: "Compose new post",
  },
  drafts: {
    title: "No drafts",
    description: "Koi draft save nahi. Compose se likh kar draft save karo.",
    actionLabel: "Start composing",
  },
  scheduled: {
    title: "No scheduled posts",
    description: "Abhi koi post schedule nahi. Compose se date/time set karo.",
    actionLabel: "Schedule a post",
  },
  trashed: {
    title: "Trash is empty",
    description: "Trash mein koi post nahi. Delete ki hui posts yahan dikhengi.",
    actionLabel: "View all posts",
  },
};

export function PostsPage() {
  const { colors, fonts, containerSx, filterLabelSx } = usePostsTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { tab: tabParam } = useParams<{ tab?: string }>();
  const token = useAppSelector(selectToken);
  const {
    items: posts,
    loadedTab,
    counts,
    loading,
    refreshing,
    actingOnPostId,
    error,
    success,
    activeTab,
    filters,
  } = useAppSelector(selectPosts);
  const languages = DEFAULT_POST_OPTIONS.languages;

  const filterKey = useMemo(
    () => `${filters.platform ?? ""}|${filters.language ?? ""}|${filters.status ?? ""}`,
    [filters.platform, filters.language, filters.status],
  );

  useEffect(() => {
    if (tabParam && !isPostTab(tabParam)) {
      navigate("/posts", { replace: true });
      return;
    }

    const nextTab: PostTab = tabParam && isPostTab(tabParam) ? tabParam : "all";
    if (nextTab !== activeTab) {
      dispatch(setActiveTab(nextTab));
    }
  }, [tabParam, activeTab, dispatch, navigate]);

  useEffect(() => {
    const platformParam = searchParams.get("platform") ?? undefined;
    const statusParam = searchParams.get("status") ?? undefined;

    if (platformParam !== filters.platform || statusParam !== filters.status) {
      dispatch(
        setPostFilters({
          ...filters,
          platform: platformParam,
          status: statusParam,
        }),
      );
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    dispatch(fetchPostCounts());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch, activeTab, filterKey]);

  function handleTabChange(tab: PostTab) {
    if (tab === activeTab) return;

    dispatch(setActiveTab(tab));
    const nextParams = new URLSearchParams(searchParams);
    const path = tab === "all" ? "/posts" : `/posts/${tab}`;
    navigate(nextParams.toString() ? `${path}?${nextParams}` : path);
  }

  function updateFilter(key: "platform" | "language" | "status", value: string) {
    const nextFilters = {
      ...filters,
      [key]: value || undefined,
    };
    dispatch(setPostFilters(nextFilters));

    if (key === "platform" || key === "status") {
      const nextParams = new URLSearchParams(searchParams);
      if (value) nextParams.set(key, value);
      else nextParams.delete(key);

      const path = activeTab === "all" ? "/posts" : `/posts/${activeTab}`;
      navigate(nextParams.toString() ? `${path}?${nextParams}` : path, { replace: true });
    }
  }

  function clearFilters() {
    dispatch(clearPostFilters());
    const path = activeTab === "all" ? "/posts" : `/posts/${activeTab}`;
    navigate(path, { replace: true });
  }

  const hasActiveFilters = Boolean(filters.platform || filters.language || filters.status);
  const isTabSwitching = refreshing && loadedTab !== activeTab;
  const isContentReady = loadedTab === activeTab && !refreshing;
  const isFilterRefreshing = refreshing && loadedTab === activeTab;

  const groupedPosts = useMemo(
    () => (isContentReady ? groupPostsByPlatform(posts) : []),
    [posts, isContentReady],
  );
  const showGrouped =
    isContentReady && activeTab === "all" && !filters.platform && posts.length > 0;

  function renderPostCard(post: (typeof posts)[number], groupPlatform?: string) {
    return (
      <PostCard
        key={post.id}
        post={post}
        token={token}
        acting={actingOnPostId === post.id}
        groupPlatform={groupPlatform}
        onTrash={(id) => dispatch(trashPost(id))}
        onRestore={(id) => dispatch(restorePost(id))}
        onPermanentDelete={(id) => dispatch(permanentlyDeletePost(id))}
        onPublishNow={(id) => dispatch(publishPostNow(id))}
        onCancelSchedule={(id) => dispatch(cancelPostSchedule(id))}
        onRetryFailed={(id) => dispatch(retryFailedPost(id))}
      />
    );
  }

  function renderEmptyState() {
    if (hasActiveFilters) {
      return (
        <PostsPanelEmptyState
          variant="no-results"
          title="No matching posts"
          description="In filters ke sath koi post nahi mili. Filters change karo ya clear karo."
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
      );
    }

    const empty = EMPTY_BY_TAB[activeTab];
    return (
      <PostsPanelEmptyState
        title={empty.title}
        description={empty.description}
        actionLabel={empty.actionLabel}
        onAction={() => navigate(activeTab === "trashed" ? "/posts" : "/compose")}
      />
    );
  }

  function renderPostsList() {
    if (showGrouped) {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, px: { xs: 2, sm: 3 }, py: 2.5 }}>
          {groupedPosts.map((group) => (
            <PostsPlatformSection
              key={group.key}
              platformKey={
                group.key === "CROSS_PLATFORM" || group.key === "UNASSIGNED"
                  ? undefined
                  : group.key
              }
              label={group.label}
              color={group.color}
              count={group.posts.length}
            >
              {group.posts.map((post) =>
                renderPostCard(
                  post,
                  group.key !== "CROSS_PLATFORM" && group.key !== "UNASSIGNED"
                    ? group.key
                    : undefined,
                ),
              )}
            </PostsPlatformSection>
          ))}
        </Box>
      );
    }

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, px: { xs: 2, sm: 3 }, py: 2.5 }}>
        {posts.map((post) => renderPostCard(post, filters.platform))}
      </Box>
    );
  }

  function renderPanelBody() {
    if (loading && loadedTab === null) {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, px: { xs: 2, sm: 3 }, py: 2.5 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </Box>
      );
    }

    if (isTabSwitching) {
      return <PageStateLoader label="Loading posts..." />;
    }

    if (isContentReady && posts.length === 0) {
      return renderEmptyState();
    }

    if (isContentReady) {
      return (
        <Box
          sx={{
            borderTop: "1px solid",
            borderColor: colors.line,
            opacity: isFilterRefreshing ? 0.65 : 1,
            transition: "opacity 0.2s ease",
            pointerEvents: isFilterRefreshing ? "none" : "auto",
            position: "relative",
          }}
        >
          {isFilterRefreshing && (
            <LinearProgress
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
              }}
            />
          )}
          {renderPostsList()}
        </Box>
      );
    }

    return null;
  }

  return (
    <Box sx={{ display: "flex", width: "100%", flexDirection: "column" }}>
      <PostsPageHeader onNewPost={() => navigate("/compose")} />

      <Collapse in={Boolean(error)}>
        {error && (
          <Alert severity="error" onClose={() => dispatch(clearPostsError())} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Collapse>

      <Collapse in={Boolean(success)}>
        {success && (
          <Alert severity="success" onClose={() => dispatch(clearPostsSuccess())} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
      </Collapse>

      <Box sx={containerSx}>
        <PostsTabBar
          activeTab={activeTab}
          counts={counts}
          onChange={handleTabChange}
          disabled={isTabSwitching}
        />

        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.75, pb: 0.75 }}>
          <Typography sx={filterLabelSx}>Platform</Typography>
          <Box sx={{ mb: 2.75 }}>
            <PostsPlatformFilter
              posts={isContentReady ? posts : []}
              value={filters.platform}
              onChange={(platform) => updateFilter("platform", platform ?? "")}
            />
          </Box>

          {activeTab === "all" && (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  mb: 0.25,
                }}
              >
                <Typography sx={{ ...filterLabelSx, mb: 0, mt: 0 }}>Filters</Typography>
                {hasActiveFilters && (
                  <Button
                    onClick={clearFilters}
                    sx={{
                      textTransform: "none",
                      fontSize: 12,
                      fontWeight: 600,
                      color: colors.accent,
                      fontFamily: fonts.body,
                      minWidth: 0,
                      p: 0,
                      "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </Box>
              <PostsFilterSelects
                language={filters.language ?? ""}
                status={filters.status ?? ""}
                languages={languages}
                onLanguageChange={(value) => updateFilter("language", value)}
                onStatusChange={(value) => updateFilter("status", value)}
              />
            </>
          )}
        </Box>

        {renderPanelBody()}
      </Box>
    </Box>
  );
}
