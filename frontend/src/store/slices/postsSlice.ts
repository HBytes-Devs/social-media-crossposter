import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../lib/api";
import type { Post, PostCounts as ApiPostCounts } from "../../types";
import type { RootState } from "../types";
import { selectToken } from "./authSlice";

export type PostTab = "all" | "published" | "drafts" | "scheduled" | "trashed";

export type PostFilters = {
  platform?: string;
  language?: string;
  status?: string;
};

type TabCounts = Record<PostTab, number>;

type PostsState = {
  items: Post[];
  loadedTab: PostTab | null;
  counts: TabCounts;
  loading: boolean;
  refreshing: boolean;
  countsLoading: boolean;
  actingOnPostId: string | null;
  error: string | null;
  success: string | null;
  activeTab: PostTab;
  filters: PostFilters;
};

function toTabCounts(counts: ApiPostCounts): TabCounts {
  return {
    all: counts.all,
    published: counts.published,
    drafts: counts.drafts,
    scheduled: counts.scheduled,
    trashed: counts.trashed,
  };
}

const emptyCounts: TabCounts = {
  all: 0,
  published: 0,
  drafts: 0,
  scheduled: 0,
  trashed: 0,
};

const initialState: PostsState = {
  items: [],
  loadedTab: null,
  counts: emptyCounts,
  loading: false,
  refreshing: false,
  countsLoading: false,
  actingOnPostId: null,
  error: null,
  success: null,
  activeTab: "all",
  filters: {},
};

export const fetchPostCounts = createAsyncThunk(
  "posts/fetchPostCounts",
  async (_, { getState, rejectWithValue }) => {
    const token = selectToken(getState() as RootState);
    if (!token) return rejectWithValue("Not authenticated");

    try {
      const counts = await api.getPostCounts(token);
      return toTabCounts(counts);
    } catch {
      return rejectWithValue("Failed to load post counts");
    }
  },
);

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (_, { getState, rejectWithValue }) => {
    const token = selectToken(getState() as RootState);
    if (!token) return rejectWithValue("Not authenticated");

    const { activeTab, filters } = (getState() as RootState).posts;

    try {
      const res = await api.listPosts(token, { tab: activeTab, ...filters });
      return res.data.posts;
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Posts load nahi hui — page refresh karo",
      );
    }
  },
);

async function refreshPosts(dispatch: (action: unknown) => unknown) {
  await dispatch(fetchPosts());
  await dispatch(fetchPostCounts());
}

export const trashPost = createAsyncThunk(
  "posts/trashPost",
  async (postId: string, { getState, rejectWithValue, dispatch }) => {
    const token = selectToken(getState() as RootState);
    if (!token) return rejectWithValue("Not authenticated");

    try {
      await api.deletePost(token, postId);
      await refreshPosts(dispatch);
      return { postId, message: "Post moved to trash" };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to delete post");
    }
  },
);

export const restorePost = createAsyncThunk(
  "posts/restorePost",
  async (postId: string, { getState, rejectWithValue, dispatch }) => {
    const token = selectToken(getState() as RootState);
    if (!token) return rejectWithValue("Not authenticated");

    try {
      await api.restorePost(token, postId);
      await refreshPosts(dispatch);
      return { postId, message: "Post restored" };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to restore post");
    }
  },
);

export const permanentlyDeletePost = createAsyncThunk(
  "posts/permanentlyDeletePost",
  async (postId: string, { getState, rejectWithValue, dispatch }) => {
    const token = selectToken(getState() as RootState);
    if (!token) return rejectWithValue("Not authenticated");

    try {
      await api.deletePost(token, postId, true);
      await refreshPosts(dispatch);
      return { postId, message: "Post permanently deleted" };
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to permanently delete post",
      );
    }
  },
);

export const publishPostNow = createAsyncThunk(
  "posts/publishPostNow",
  async (postId: string, { getState, rejectWithValue, dispatch }) => {
    const token = selectToken(getState() as RootState);
    if (!token) return rejectWithValue("Not authenticated");

    try {
      const result = await api.publishPost(token, postId);
      await refreshPosts(dispatch);
      return { postId, message: `Published — status: ${result.post.status}` };
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Publish fail — account connected hai check karo",
      );
    }
  },
);

export const retryFailedPost = createAsyncThunk(
  "posts/retryFailedPost",
  async (postId: string, { getState, rejectWithValue, dispatch }) => {
    const token = selectToken(getState() as RootState);
    if (!token) return rejectWithValue("Login zaroori hai");

    try {
      const result = await api.retryPost(token, postId);
      await refreshPosts(dispatch);
      const statusMsg =
        result.post.status === "PUBLISHED"
          ? "Retry successful — post publish ho gayi"
          : result.post.status === "PARTIAL"
            ? "Kuch platforms ab bhi fail — neeche errors dekho"
            : "Retry fail — account reconnect ya content check karo";
      return { postId, message: statusMsg };
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Retry nahi ho saki — dubara try karo",
      );
    }
  },
);

export const cancelPostSchedule = createAsyncThunk(
  "posts/cancelPostSchedule",
  async (postId: string, { getState, rejectWithValue, dispatch }) => {
    const token = selectToken(getState() as RootState);
    if (!token) return rejectWithValue("Not authenticated");

    try {
      await api.cancelSchedule(token, postId);
      await refreshPosts(dispatch);
      return { postId, message: "Schedule cancelled — moved to drafts" };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to cancel schedule");
    }
  },
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<PostTab>) {
      state.activeTab = action.payload;
      if (action.payload !== "all") {
        const { platform } = state.filters;
        state.filters = platform ? { platform } : {};
      }
    },
    setPostFilters(state, action: PayloadAction<PostFilters>) {
      state.filters = action.payload;
    },
    clearPostFilters(state) {
      state.filters = {};
    },
    clearPostsError(state) {
      state.error = null;
    },
    clearPostsSuccess(state) {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostCounts.pending, (state) => {
        state.countsLoading = true;
      })
      .addCase(fetchPostCounts.fulfilled, (state, action) => {
        state.countsLoading = false;
        state.counts = action.payload;
      })
      .addCase(fetchPostCounts.rejected, (state) => {
        state.countsLoading = false;
      })
      .addCase(fetchPosts.pending, (state) => {
        state.refreshing = true;
        state.loading = state.loadedTab === null;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.refreshing = false;
        state.loading = false;
        state.items = action.payload;
        state.loadedTab = state.activeTab;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.refreshing = false;
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to load posts";
      })
      .addMatcher(
        (action) =>
          trashPost.pending.match(action) ||
          restorePost.pending.match(action) ||
          permanentlyDeletePost.pending.match(action) ||
          publishPostNow.pending.match(action) ||
          retryFailedPost.pending.match(action) ||
          cancelPostSchedule.pending.match(action),
        (state, action) => {
          state.actingOnPostId = action.meta.arg as string;
          state.error = null;
        },
      )
      .addMatcher(
        (action) =>
          trashPost.fulfilled.match(action) ||
          restorePost.fulfilled.match(action) ||
          permanentlyDeletePost.fulfilled.match(action) ||
          publishPostNow.fulfilled.match(action) ||
          retryFailedPost.fulfilled.match(action) ||
          cancelPostSchedule.fulfilled.match(action),
        (state, action) => {
          state.actingOnPostId = null;
          state.success = action.payload.message;
        },
      )
      .addMatcher(
        (action) =>
          trashPost.rejected.match(action) ||
          restorePost.rejected.match(action) ||
          permanentlyDeletePost.rejected.match(action) ||
          publishPostNow.rejected.match(action) ||
          retryFailedPost.rejected.match(action) ||
          cancelPostSchedule.rejected.match(action),
        (state, action) => {
          state.actingOnPostId = null;
          state.error = (action.payload as string) ?? "Action failed";
        },
      );
  },
});

export const {
  setActiveTab,
  setPostFilters,
  clearPostFilters,
  clearPostsError,
  clearPostsSuccess,
} = postsSlice.actions;
export default postsSlice.reducer;

export const selectPosts = (state: { posts: PostsState }) => state.posts;

export function isPostTab(value: string | undefined): value is PostTab {
  return (
    value === "all" ||
    value === "published" ||
    value === "drafts" ||
    value === "scheduled" ||
    value === "trashed"
  );
}
