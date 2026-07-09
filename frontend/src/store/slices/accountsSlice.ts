import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../lib/api";
import type { PlatformStatus, SocialAccount } from "../../types";
import type { RootState } from "../types";
import { selectToken } from "./authSlice";

type AccountsState = {
  items: SocialAccount[];
  platforms: PlatformStatus[];
  loading: boolean;
  platformsLoading: boolean;
  connecting: string | null;
  error: string | null;
};

const initialState: AccountsState = {
  items: [],
  platforms: [],
  loading: false,
  platformsLoading: false,
  connecting: null,
  error: null,
};

export const fetchPlatforms = createAsyncThunk(
  "accounts/fetchPlatforms",
  async (_, { getState, rejectWithValue }) => {
    const token = selectToken(getState() as RootState);
    if (!token) return rejectWithValue("Not authenticated");

    try {
      const res = await api.listPlatforms(token);
      return res.data.platforms;
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to load platforms",
      );
    }
  },
);

export const fetchAccounts = createAsyncThunk(
  "accounts/fetchAccounts",
  async (_, { getState, rejectWithValue }) => {
    const token = selectToken(getState() as RootState);
    if (!token) return rejectWithValue("Not authenticated");

    try {
      const res = await api.listAccounts(token);
      return res.data.accounts;
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to load accounts",
      );
    }
  },
);

export const connectPlatform = createAsyncThunk(
  "accounts/connect",
  async (slug: string, { getState, rejectWithValue }) => {
    const token = selectToken(getState() as RootState);
    if (!token) return rejectWithValue("Not authenticated");

    try {
      const res = await api.getConnectUrl(token, slug);
      const url = res.data.browserUrl ?? res.data.authUrl;
      window.open(url, "_blank", "noopener,noreferrer");
      return slug.toUpperCase();
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to get connect URL",
      );
    }
  },
);

export const disconnectAccount = createAsyncThunk(
  "accounts/disconnect",
  async (accountId: string, { getState, rejectWithValue }) => {
    const token = selectToken(getState() as RootState);
    if (!token) return rejectWithValue("Not authenticated");

    try {
      await api.disconnectAccount(token, accountId);
      return accountId;
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Disconnect failed",
      );
    }
  },
);

const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    clearAccountsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatforms.pending, (state) => {
        state.platformsLoading = true;
      })
      .addCase(fetchPlatforms.fulfilled, (state, action) => {
        state.platformsLoading = false;
        state.platforms = action.payload;
      })
      .addCase(fetchPlatforms.rejected, (state) => {
        state.platformsLoading = false;
      })
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to load accounts";
      })
      .addCase(connectPlatform.pending, (state, action) => {
        state.connecting = action.meta.arg.toUpperCase();
        state.error = null;
      })
      .addCase(connectPlatform.fulfilled, (state) => {
        state.connecting = null;
      })
      .addCase(connectPlatform.rejected, (state, action) => {
        state.connecting = null;
        state.error = (action.payload as string) ?? "Connect failed";
      })
      .addCase(disconnectAccount.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.id !== action.payload);
      })
      .addCase(disconnectAccount.rejected, (state, action) => {
        state.error = (action.payload as string) ?? "Disconnect failed";
      });
  },
});

export const { clearAccountsError } = accountsSlice.actions;
export default accountsSlice.reducer;

export const selectAccounts = (state: { accounts: AccountsState }) => state.accounts;
