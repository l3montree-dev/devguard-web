"use client";

import type { StepType } from "@reactour/tour";
import { useEffect } from "react";
import { useTourContext } from "@/context/TourContext";

export type ConditionalStep = StepType & { condition?: boolean };

export function usePageTour(steps: ConditionalStep[]) {
  const { registerSteps, openTour } = useTourContext();

  useEffect(() => {
    registerSteps(steps.filter((s) => s.condition !== false));
  }, [steps, registerSteps]);

  return { startTour: openTour, registerSteps };
}
