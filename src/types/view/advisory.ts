// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { components } from "@/types/api/generated";
import type { VulnEventDTO } from "@/types/view/vulnEvents";

// id is omitempty and both version bounds are pointers in Go, so all three are
// optional despite the spec declaring them required.
export type AdvisoryAffectedPackage = Omit<
  components["schemas"]["dtos.AffectedPackage"],
  "id" | "versionStart" | "versionEnd"
> & {
  id?: string;
  versionStart: string | null;
  versionEnd: string | null;
};

export type PackageRow = AdvisoryAffectedPackage;

export interface AdvisoryFormData {
  title: string;
  description: string;
  severity: string;
  vectorString: string;
  affectedPackages: PackageRow[];
  state: string;
}

export interface AdvisoryEventSubmit {
  status?: VulnEventDTO["type"];
  justification?: string;
  mechanicalJustification?: string;
}

export interface AdvisorySection {
  label: string | null; // can be null if no label can be determined
  content: string;
}

export type AdvisoryState = "draft" | "public" | "withdrawn";

export interface SecurityAdvisory {
  id: string;
  title: string;
  description: string;
  severity: string;
  vectorString: string;
  assetID: string;
  affectedPackages: AdvisoryAffectedPackage[] | null;
  state: AdvisoryState;
  createdAt: string;
  updatedAt: string;
}

export interface DetailedSecurityAdvisoryDTO extends SecurityAdvisory {
  events: VulnEventDTO[];
}
