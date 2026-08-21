// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { VulnEventDTO } from "@/types/api/api";

export interface AssessmentSubmit {
  status: VulnEventDTO["type"];
  justification?: string;
  mechanicalJustification?: string;
}
