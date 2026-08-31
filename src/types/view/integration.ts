// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { ArtifactDTO, AssetVersionDTO } from "@/types/dto";

export type ManualUploadKind = "sbom" | "sarif" | "vex";

export interface ManualUploadTab {
  value: ManualUploadKind;
  title: string;
  description: string;
  originLabel: string;
  originHint: string;
  showArtifact: boolean;
  docHref?: string;
  docLabel?: string;
}

export interface ManualUploadOptions {
  branches: AssetVersionDTO[];
  tags: AssetVersionDTO[];
  branchOrTagName: string;
  onBranchOrTagChange: (name: string, slug: string, isTag: boolean) => void;
  isTag: boolean;
  onIsTagChange: (isTag: boolean) => void;
  artifactName: string;
  onArtifactNameChange: (name: string) => void;
  artifacts?: Array<ArtifactDTO>;
  selectedArtifact?: string;
  onSelectedArtifactChange: (name: string | undefined) => void;
  origin: string;
  onOriginChange: (origin: string) => void;
  onReInit: () => void;
}

export type JobName =
  | "secret-scanning"
  | "sast"
  | "iac"
  | "sca"
  | "build"
  | "container-scanning"
  | "push"
  | "sign"
  | "attest"
  | "full"
  | "sbom-upload"
  | "sarif-upload";
