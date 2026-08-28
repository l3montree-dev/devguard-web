// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { AssetDTO } from "@/types/dto";
import type { SubGroupProject, SubGroupsAndAsset } from "@/types/view/project";

export function isProject(d: SubGroupsAndAsset): d is SubGroupProject {
  return d.resourceType === "project";
}

export function checkType(data: SubGroupsAndAsset):
  | {
      asset: AssetDTO & { resourceType: "asset" };
      subgroup: null;
    }
  | {
      asset: null;
      subgroup: SubGroupProject;
    } {
  return isProject(data)
    ? { asset: null, subgroup: data }
    : { asset: data, subgroup: null };
}
