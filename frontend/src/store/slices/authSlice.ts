import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../lib/api";
import type { AuthUser } from "../../types";
import type { RootState } from "../types";
import { TOKEN_KEY } from "../constants";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
};

const storedToken = localStorage.getItem(TOKEN_KEY);

const initialState: AuthState = {
  user: null,
  token: storedToken,
  loading: Boolean(storedToken),
  error: null,
};

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).auth.token;
    if (!token) return null;

    try {
      const res = await api.me(token);
      return res.data.user;
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      return rejectWithValue("Session expired");
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.login(email, password);
      localStorage.setItem(TOKEN_KEY, res.data.token);
      return { user: res.data.user, token: res.data.token };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Login failed");
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    { email, password, name }: { email: string; password: string; name?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.register(email, password, name);
      localStorage.setItem(TOKEN_KEY, res.data.token);
      return { user: res.data.user, token: res.data.token };
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Registration failed",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem(TOKEN_KEY);
      state.user = null;
      state.token = null;
      state.error = null;
      state.loading = false;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        if (state.token) state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Login failed";
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Registration failed";
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
