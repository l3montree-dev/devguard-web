"use client";

import type { StepType } from "@reactour/tour";
import { useTourContext } from "@/context/TourContext";

export function usePageTour(steps: StepType[]) {
  const { startTour } = useTourContext();

  return {
    startTour: () => startTour(steps),
  };
}
