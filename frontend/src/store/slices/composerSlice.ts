import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../lib/api";
import type { HashtagMode, MediaItem, PostOptions, SocialAccount } from "../../types";
import { DEFAULT_POST_OPTIONS } from "../constants";
import type { RootState } from "../types";
import { selectToken } from "./authSlice";

type ComposerState = {
  content: string;
  title: string;
  subreddit: string;
  hashtagMode: HashtagMode;
  hashtags: string[];
  language: string;
  images: string[];
  options: PostOptions;
  accounts: SocialAccount[];
  selectedAccounts: string[];
  mediaLibrary: MediaItem[];
  previewContent: string;
  previewTags: string[];
  previewLoading: boolean;
  uploading: boolean;
  submitting: boolean;
  error: string | null;
  success: string | null;
  initialized: boolean;
};

const initialState: ComposerState = {
  content: "",
  title: "",
  subreddit: "test",
  hashtagMode: "auto",
  hashtags: [],
  language: "en",
  images: [],
  options: DEFAULT_POST_OPTIONS,
  accounts: [],
  selectedAccounts: [],
  mediaLibrary: [],
  previewContent: "",
  previewTags: [],
  previewLoading: false,
  uploading: false,
  submitting: false,
  error: null,
  success: null,
  initialized: false,
};

export const fetchComposerData = createAsyncThunk(
  "composer/fetchData",
  async (_, { getState, rejectWithValue }) => {
    const token = selectToken(getState() as RootState);
    if (!token) return rejectWithValue("Not authenticated");

    try {
      const [optsRes, accRes, mediaRes] = await Promise.all([
        api.getPostOptions(token),
        api.listAccounts(token),
        api.listMedia(token),
      ]);

      return {
        options: optsRes.data,
        accounts: accRes.data.accounts,
        media: mediaRes.data.media,
      };
    } catch {
      return rejectWithValue("Failed to load composer data");
    }
  },
);

export const fetchPreview = createAsyncThunk(
  "composer/fetchPreview",
  async (_, { getState, rejectWithValue }) => {
    const state = (getState() as RootState).composer;
    const token = selectToken(getState() as RootState);
    if (!token) return rejectWithValue("Not authenticated");

    if (!state.content.trim() && state.images.length === 0) {
      return { finalContent: "", hashtags: [] as string[] };
    }

    try {
      const res = await api.previewPost(token, {
        content: state.content,
        images: state.images,
        hashtagMode: state.hashtagMode,
        hashtags: state.hashtags,
        language: state.language,
      });
      return res.data;
    } catch {
      return { finalContent: state.content, hashtags: state.hashtags };
    }
  },
);

export const uploadImages = createAsyncThunk(
  "composer/uploadImages",
  async (files: File[], { getState, rejectWithValue }) => {
    const token = selectToken(getState() as RootState);
    if (!token) return rejectWithValue("Not authenticated");

    try {
      const res = await api.uploadImages(token, files);
      return res.data.media;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Upload failed");
    }
  },
);

export const submitPost = createAsyncThunk(
  "composer/submitPost",
  async (publish: boolean, { getState, rejectWithValue }) => {
    const state = (getState() as RootState).composer;
    const token = selectToken(getState() as RootState);
    if (!token) return rejectWithValue("Not authenticated");

    if (!state.content.trim() && state.images.length === 0) {
      return rejectWithValue("Content ya kam az kam ek image zaroori hai");
    }

    if (state.selectedAccounts.length === 0) {
      return rejectWithValue("Kam az kam ek platform account select karo");
    }

    const hasReddit = state.selectedAccounts.some((id) => {
      const acc = state.accounts.find((a) => a.id === id);
      return acc?.platform === "REDDIT";
    });

    if (hasReddit) {
      if (!state.title.trim()) {
        return rejectWithValue("Reddit ke liye title zaroori hai");
      }
      if (!state.subreddit.trim()) {
        return rejectWithValue("Reddit ke liye subreddit zaroori hai (e.g. test)");
      }
    }

    try {
      const res = await api.createPost(token, {
        content: state.content,
        title: state.title.trim() || undefined,
        images: state.images,
        hashtagMode: state.hashtagMode,
        hashtags: state.hashtags,
        language: state.language,
        publish,
        targets: state.selectedAccounts.map((id) => {
          const acc = state.accounts.find((a) => a.id === id);
          return {
            socialAccountId: id,
            ...(acc?.platform === "REDDIT"
              ? { subreddit: state.subreddit.trim().replace(/^r\//i, "") }
              : {}),
          };
        }),
      });

      return { post: res.data.post, publish };
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to create post",
      );
    }
  },
);

const composerSlice = createSlice({
  name: "composer",
  initialState,
  reducers: {
    setContent(state, action: PayloadAction<string>) {
      state.content = action.payload;
      state.success = null;
    },
    setTitle(state, action: PayloadAction<string>) {
      state.title = action.payload;
      state.success = null;
    },
    setSubreddit(state, action: PayloadAction<string>) {
      state.subreddit = action.payload;
      state.success = null;
    },
    setHashtagMode(state, action: PayloadAction<HashtagMode>) {
      state.hashtagMode = action.payload;
      state.success = null;
    },
    setHashtags(state, action: PayloadAction<string[]>) {
      state.hashtags = action.payload;
      state.success = null;
    },
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
      state.success = null;
    },
    setImages(state, action: PayloadAction<string[]>) {
      state.images = action.payload;
      state.success = null;
    },
    toggleImage(state, action: PayloadAction<string>) {
      const url = action.payload;
      state.images = state.images.includes(url)
        ? state.images.filter((u) => u !== url)
        : [...state.images, url];
      state.success = null;
    },
    removeImage(state, action: PayloadAction<string>) {
      state.images = state.images.filter((u) => u !== action.payload);
      state.success = null;
    },
    toggleAccount(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.selectedAccounts = state.selectedAccounts.includes(id)
        ? state.selectedAccounts.filter((a) => a !== id)
        : [...state.selectedAccounts, id];
    },
    clearComposerMessages(state) {
      state.error = null;
      state.success = null;
    },
    resetComposerForm(state) {
      state.content = "";
      state.title = "";
      state.subreddit = "test";
      state.hashtags = [];
      state.images = [];
      state.previewContent = "";
      state.previewTags = [];
      state.success = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComposerData.fulfilled, (state, action) => {
        state.options = action.payload.options;
        state.accounts = action.payload.accounts;
        state.mediaLibrary = action.payload.media;
        state.initialized = true;

        if (
          action.payload.accounts.length === 1 &&
          state.selectedAccounts.length === 0
        ) {
          state.selectedAccounts = [action.payload.accounts[0].id];
        }
      })
      .addCase(fetchPreview.pending, (state) => {
        state.previewLoading = true;
      })
      .addCase(fetchPreview.fulfilled, (state, action) => {
        state.previewLoading = false;
        state.previewContent = action.payload.finalContent;
        state.previewTags = action.payload.hashtags;
      })
      .addCase(fetchPreview.rejected, (state) => {
        state.previewLoading = false;
      })
      .addCase(uploadImages.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadImages.fulfilled, (state, action) => {
        state.uploading = false;
        const urls = action.payload.map((m) => m.url);
        state.mediaLibrary = [...action.payload, ...state.mediaLibrary];
        state.images = [...state.images, ...urls];
      })
      .addCase(uploadImages.rejected, (state, action) => {
        state.uploading = false;
        state.error = (action.payload as string) ?? "Upload failed";
      })
      .addCase(submitPost.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = null;
      })
      .addCase(submitPost.fulfilled, (state, action) => {
        state.submitting = false;
        const { post, publish } = action.payload;
        state.success = publish
          ? `Post published! Status: ${post.status}`
          : "Draft saved successfully";

        if (publish) {
          state.content = "";
          state.hashtags = [];
          state.images = [];
          state.previewContent = "";
          state.previewTags = [];
        }
      })
      .addCase(submitPost.rejected, (state, action) => {
        state.submitting = false;
        state.error = (action.payload as string) ?? "Failed to create post";
      });
  },
});

export const {
  setContent,
  setTitle,
  setSubreddit,
  setHashtagMode,
  setHashtags,
  setLanguage,
  toggleImage,
  removeImage,
  toggleAccount,
  clearComposerMessages,
  resetComposerForm,
} = composerSlice.actions;

export default composerSlice.reducer;

export const selectComposer = (state: { composer: ComposerState }) => state.composer;
