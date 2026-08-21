// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { AdvisoryAffectedPackage, VulnEventDTO } from "@/types/api/api";

export type PackageRow = Omit<AdvisoryAffectedPackage, "id"> & { id?: string };

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
