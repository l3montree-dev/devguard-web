// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { Building2 } from "lucide-react";
import type { ReactNode } from "react";

export type StepState = "existing" | "pending" | "next";

export interface Step {
  Icon: typeof Building2;
  label: string;
  value: ReactNode;
  description: ReactNode;
  state: StepState;
}
