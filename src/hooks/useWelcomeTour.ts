"use client";

import { dismissAllTours, useTourSeen } from "./useTourSeen";

export function useWelcomeTour() {
  const { showModal, markSeen } = useTourSeen("org-home");

  const handleStartTour = (startTour: () => void) => {
    markSeen();
    startTour();
  };

  const handleSkip = () => {
    dismissAllTours();
    markSeen();
  };

  return {
    showModal,
    handleStartTour,
    handleSkip,
  };
}
