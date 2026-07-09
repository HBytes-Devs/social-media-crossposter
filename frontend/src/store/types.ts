import type authReducer from "./slices/authSlice";
import type accountsReducer from "./slices/accountsSlice";
import type composerReducer from "./slices/composerSlice";
import type postsReducer from "./slices/postsSlice";

export type RootState = {
  auth: ReturnType<typeof authReducer>;
  accounts: ReturnType<typeof accountsReducer>;
  composer: ReturnType<typeof composerReducer>;
  posts: ReturnType<typeof postsReducer>;
};
