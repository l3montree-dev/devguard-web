// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type {
  ArtifactDTO,
  AssetDTO,
  DependencyVuln,
  ExternalReferenceErrorDTO,
} from "@/types/api/api";
import type { Modify } from "@/types/common";

export type AssetFormValues = Modify<
  AssetDTO,
  {
    cvssAutomaticTicketThreshold: number[];
    riskAutomaticTicketThreshold: number[];
    enableTicketRange: boolean;
  }
>;

export type SecretType = "webhook";

export interface UpdateArtifactResponse {
  artifact: ArtifactDTO;
  invalidURLs: ExternalReferenceErrorDTO[];
}

export type QuickfixVuln = Pick<
  DependencyVuln,
  "directDependencyFixedVersion" | "componentFixedVersion" | "vulnerabilityPath"
>;
