// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { StepType } from "@reactour/tour";

export interface TourContextType {
  registerSteps: (steps: StepType[]) => void;
  openTour: () => void;
  hasSteps: boolean;
}

export type ConditionalStep = StepType & { condition?: boolean };
