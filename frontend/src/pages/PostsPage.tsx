import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PostCard } from "../components/posts/PostCard";
import { PostsPanelSection } from "../components/posts/PostsPanelSection";
import { PostsPlatformFilter } from "../components/posts/PostsPlatformFilter";
import { PostsPlatformSection } from "../components/posts/PostsPlatformSection";
import { PostsTabBar } from "../components/posts/PostsTabBar";
import { PostCardSkeleton } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState, NoResultsState, PageStateLoader } from "../components/ui/PageState";
import { Select } from "../components/ui/Select";
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
        <NoResultsState
          title="No matching posts"
          description="In filters ke sath koi post nahi mili. Filters change karo ya clear karo."
          actionLabel="Clear filters"
          onAction={() => {
            dispatch(clearPostFilters());
            const path = activeTab === "all" ? "/posts" : `/posts/${activeTab}`;
            navigate(path, { replace: true });
          }}
        />
      );
    }

    const empty = EMPTY_BY_TAB[activeTab];
    return (
      <EmptyState
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {posts.map((post) => renderPostCard(post, filters.platform))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", width: "100%", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 1.5 }}>
        <div>
          <Typography variant="h4" fontWeight={800}>
            Posts
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Published, drafts, trash — sab manage yahan
          </Typography>
        </div>
        <Button variant="secondary" onClick={() => navigate("/compose")}>
          + New post
        </Button>
      </Box>

      <Collapse in={Boolean(error)}>
        {error && (
          <Alert severity="error" onClose={() => dispatch(clearPostsError())}>
            {error}
          </Alert>
        )}
      </Collapse>

      <Collapse in={Boolean(success)}>
        {success && (
          <Alert severity="success" onClose={() => dispatch(clearPostsSuccess())}>
            {success}
          </Alert>
        )}
      </Collapse>

      <Card padding="none" className="overflow-hidden">
        <PostsPanelSection first>
          <PostsTabBar
            activeTab={activeTab}
            counts={counts}
            onChange={handleTabChange}
            disabled={isTabSwitching}
          />
        </PostsPanelSection>

        <PostsPanelSection title="Platform">
          <PostsPlatformFilter
            posts={isContentReady ? posts : []}
            value={filters.platform}
            onChange={(platform) => updateFilter("platform", platform ?? "")}
          />
        </PostsPanelSection>

        {activeTab === "all" && (
          <PostsPanelSection
            title="Filters"
            action={
              hasActiveFilters ? (
                <Button
                  variant="ghost"
                  className="text-xs"
                  onClick={() => {
                    dispatch(clearPostFilters());
                    const path = activeTab === "all" ? "/posts" : `/posts/${activeTab}`;
                    navigate(path, { replace: true });
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          >
            <Box
              sx={{
                display: "grid",
                gap: 1.5,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 240px))",
                },
              }}
            >
              <Select
                label="Language"
                value={filters.language ?? ""}
                onChange={(e) => updateFilter("language", e.target.value)}
              >
                <option value="">All languages</option>
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </Select>

              <Select
                label="Status"
                value={filters.status ?? ""}
                onChange={(e) => updateFilter("status", e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PUBLISHED">Published</option>
                <option value="PARTIAL">Partial</option>
                <option value="FAILED">Failed</option>
                <option value="PUBLISHING">Publishing</option>
              </Select>
            </Box>
          </PostsPanelSection>
        )}
      </Card>

      <Box sx={{ position: "relative", minHeight: 120 }}>
        {refreshing && (
          <LinearProgress
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              borderRadius: 1,
            }}
          />
        )}

        {loading && loadedTab === null ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </Box>
        ) : isTabSwitching ? (
          <PageStateLoader label="Loading posts..." />
        ) : isContentReady && posts.length === 0 ? (
          <Card>{renderEmptyState()}</Card>
        ) : isContentReady ? (
          <Box
            sx={{
              pt: 1,
              opacity: isFilterRefreshing ? 0.65 : 1,
              transition: "opacity 0.2s ease",
              pointerEvents: isFilterRefreshing ? "none" : "auto",
            }}
          >
            {renderPostsList()}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
