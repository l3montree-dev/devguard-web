// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { DetailedComplianceRiskDTO } from "@/types/api/api";

export type BadgeVariant = "CRITICAL" | "MEDIUM" | "LOW" | "HIGH";

export type ControlRelationship =
  DetailedComplianceRiskDTO["mappedControls"][number]["relationship"];
