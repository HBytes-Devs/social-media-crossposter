import { useCallback } from "react";
import { markTourCompleted, markWelcomeSeen, TOUR_STEPS } from "../../lib/onboarding";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectAuth } from "../../store/slices/authSlice";
import {
  closeWelcome,
  endTour,
  nextTourStep,
  prevTourStep,
  selectOnboarding,
  startTour,
} from "../../store/slices/onboardingSlice";
import { ProductTour } from "./ProductTour";
import { WelcomeModal } from "./WelcomeModal";

export function OnboardingFlow() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const { welcomeOpen, tourActive, tourStep } = useAppSelector(selectOnboarding);

  const userId = user?.id;

  const handleSkipWelcome = useCallback(() => {
    if (userId) markWelcomeSeen(userId);
    dispatch(closeWelcome());
  }, [dispatch, userId]);

  const handleStartTour = useCallback(() => {
    if (userId) markWelcomeSeen(userId);
    dispatch(startTour());
  }, [dispatch, userId]);

  const handleSkipTour = useCallback(() => {
    if (userId) {
      markWelcomeSeen(userId);
      markTourCompleted(userId);
    }
    dispatch(endTour());
  }, [dispatch, userId]);

  const handleFinishTour = useCallback(() => {
    if (userId) {
      markWelcomeSeen(userId);
      markTourCompleted(userId);
    }
    dispatch(endTour());
  }, [dispatch, userId]);

  const handleNext = useCallback(() => {
    if (tourStep >= TOUR_STEPS.length - 1) {
      handleFinishTour();
      return;
    }
    dispatch(nextTourStep());
  }, [dispatch, handleFinishTour, tourStep]);

  if (!userId) return null;

  return (
    <>
      <WelcomeModal
        open={welcomeOpen}
        onStartTour={handleStartTour}
        onSkip={handleSkipWelcome}
      />
      <ProductTour
        active={tourActive}
        step={tourStep}
        onNext={handleNext}
        onPrev={() => dispatch(prevTourStep())}
        onSkip={handleSkipTour}
        onFinish={handleFinishTour}
      />
    </>
  );
}
