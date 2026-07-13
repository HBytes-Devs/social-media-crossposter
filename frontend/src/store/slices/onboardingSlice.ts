import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { loginUser, registerUser, logout } from "./authSlice";
import { shouldShowWelcome } from "../../lib/onboarding";

type OnboardingState = {
  welcomeOpen: boolean;
  tourActive: boolean;
  tourStep: number;
};

const initialState: OnboardingState = {
  welcomeOpen: false,
  tourActive: false,
  tourStep: 0,
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    openWelcome(state) {
      state.welcomeOpen = true;
    },
    closeWelcome(state) {
      state.welcomeOpen = false;
    },
    startTour(state) {
      state.welcomeOpen = false;
      state.tourActive = true;
      state.tourStep = 0;
    },
    nextTourStep(state) {
      state.tourStep += 1;
    },
    prevTourStep(state) {
      state.tourStep = Math.max(0, state.tourStep - 1);
    },
    endTour(state) {
      state.tourActive = false;
      state.tourStep = 0;
    },
    setTourStep(state, action: PayloadAction<number>) {
      state.tourStep = action.payload;
    },
    replayTour(state) {
      state.welcomeOpen = false;
      state.tourActive = true;
      state.tourStep = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        if (shouldShowWelcome(action.payload.user.id)) {
          state.welcomeOpen = true;
        }
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.welcomeOpen = true;
      })
      .addCase(logout, (state) => {
        state.welcomeOpen = false;
        state.tourActive = false;
        state.tourStep = 0;
      });
  },
});

export const {
  openWelcome,
  closeWelcome,
  startTour,
  nextTourStep,
  prevTourStep,
  endTour,
  setTourStep,
  replayTour,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;

export const selectOnboarding = (state: { onboarding: OnboardingState }) => state.onboarding;
