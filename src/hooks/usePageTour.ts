// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { useEffect } from "react";
import { useTourContext } from "@/context/TourContext";

import type { ConditionalStep } from "@/types/view/tour";

export function usePageTour(steps: ConditionalStep[]) {
  const { registerSteps, openTour } = useTourContext();

  useEffect(() => {
    registerSteps(steps.filter((s) => s.condition !== false));
  }, [steps, registerSteps]);

  return { startTour: openTour, registerSteps };
}
