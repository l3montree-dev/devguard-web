// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { AssetDTO, DependencyVuln } from "@/types/dto";

import type { Modify } from "@/types/common";

export type AssetFormValues = Modify<
  AssetDTO,
  {
    cvssAutomaticTicketThreshold: number[];
    riskAutomaticTicketThreshold: number[];
    enableTicketRange: boolean;
    enableExposureMetrics: boolean;
    keepOriginalSbomRootComponent: boolean;
    vulnAutoReopenAfterDays: number | null;
  }
>;

export type SecretType = "webhook";

export type QuickfixVuln = Pick<
  DependencyVuln,
  "directDependencyFixedVersion" | "componentFixedVersion" | "vulnerabilityPath"
>;
