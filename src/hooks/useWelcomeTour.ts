// TODO: später mit DB verknüpfen, damit Modal nur einmal pro User angezeigt wird
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "devguard:welcomeTourSeen";

const hasSeenWelcome = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
};

const markWelcomeSeen = () => {
  localStorage.setItem(STORAGE_KEY, "true");
};

export function useWelcomeTour() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!hasSeenWelcome()) {
      setShowModal(true);
    }
  }, []);

  const handleStartTour = (startTour: () => void) => {
    markWelcomeSeen();
    setShowModal(false);
    startTour();
  };

  const handleSkip = () => {
    markWelcomeSeen();
    setShowModal(false);
  };

  return {
    showModal,
    handleStartTour,
    handleSkip,
  };
}
