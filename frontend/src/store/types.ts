import type authReducer from "./slices/authSlice";
import type accountsReducer from "./slices/accountsSlice";
import type composerReducer from "./slices/composerSlice";
import type postsReducer from "./slices/postsSlice";
import type onboardingReducer from "./slices/onboardingSlice";

export type RootState = {
  auth: ReturnType<typeof authReducer>;
  accounts: ReturnType<typeof accountsReducer>;
  composer: ReturnType<typeof composerReducer>;
  posts: ReturnType<typeof postsReducer>;
  onboarding: ReturnType<typeof onboardingReducer>;
};
