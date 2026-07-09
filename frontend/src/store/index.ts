import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import accountsReducer from "./slices/accountsSlice";
import composerReducer from "./slices/composerSlice";
import postsReducer from "./slices/postsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountsReducer,
    composer: composerReducer,
    posts: postsReducer,
  },
});

export type { RootState } from "./types";
export type AppDispatch = typeof store.dispatch;
