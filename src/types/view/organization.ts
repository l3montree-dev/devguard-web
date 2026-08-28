// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { VulnDistributionInStructure } from "@/types/view/riskHistory";

export type Severity = "critical" | "high" | "medium" | "low";

export interface SeverityRemediation {
  variant: Severity;
  remediationRisk: number | undefined;
  remediationCvss: number | undefined;
  openRisk: number | undefined;
  openCvss: number | undefined;
}

export type ColorLevel = "green" | "yellow" | "orange" | "red";

export interface StructureColumn {
  type: "Projects" | "Assets" | "Artifacts";
  listTitle: string;
  count: number | undefined;
  entries: VulnDistributionInStructure[];
}
