"use client";

import { useTourSeen } from "./useTourSeen";

export function useWelcomeTour() {
  const { showModal, markSeen } = useTourSeen("org-home");

  const handleStartTour = (startTour: () => void) => {
    markSeen();
    startTour();
  };

  const handleSkip = () => {
    markSeen();
  };

  return {
    showModal,
    handleStartTour,
    handleSkip,
  };
}
