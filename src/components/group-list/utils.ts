// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type {
  AssetDTO,
  ProjectDTO,
  SubGroupsAndAsset,
} from "../../types/api/api";

export function isProject(
  d: SubGroupsAndAsset,
): d is ProjectDTO & { resourceType: "project" } {
  return d.resourceType === "project";
}

export function checkType(data: SubGroupsAndAsset):
  | {
      asset: AssetDTO & { resourceType: "asset" };
      subgroup: null;
    }
  | {
      asset: null;
      subgroup: ProjectDTO & { resourceType: "project" };
    } {
  return isProject(data)
    ? { asset: null, subgroup: data }
    : { asset: data, subgroup: null };
}
