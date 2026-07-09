import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../lib/api";
import type { Post } from "../../types";
import type { RootState } from "../types";
import { selectToken } from "./authSlice";

type PostsState = {
  items: Post[];
  loading: boolean;
  error: string | null;
};

const initialState: PostsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (_, { getState, rejectWithValue }) => {
    const token = selectToken(getState() as RootState);
    if (!token) return rejectWithValue("Not authenticated");

    try {
      const res = await api.listPosts(token);
      return res.data.posts;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to load posts");
    }
  },
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearPostsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to load posts";
      });
  },
});

export const { clearPostsError } = postsSlice.actions;
export default postsSlice.reducer;

export const selectPosts = (state: { posts: PostsState }) => state.posts;
