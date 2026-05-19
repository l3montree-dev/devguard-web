"use client";

import type { StepType } from "@reactour/tour";
import { useEffect } from "react";
import { useTourContext } from "@/context/TourContext";

export function usePageTour(steps: StepType[]) {
  const { registerSteps, openTour } = useTourContext();

  useEffect(() => {
    registerSteps(steps);
  }, [steps, registerSteps]);

  return { startTour: openTour, registerSteps };
}
