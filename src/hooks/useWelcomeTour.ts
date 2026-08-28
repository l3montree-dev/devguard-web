// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

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
