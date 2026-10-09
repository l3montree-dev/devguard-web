// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { AssetDTO, ProjectDTO } from "@/types/dto";

export type SubGroupProject = Omit<ProjectDTO, "subGroupsAndAsset"> & {
  resourceType: "project";
  state?: string;
  subGroupsAndAsset?: SubGroupsAndAsset[];
};

export type SubGroupsAndAsset =
  (AssetDTO & { resourceType: "asset" }) | SubGroupProject;
