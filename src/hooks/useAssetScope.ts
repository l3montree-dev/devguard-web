// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { AssetScope } from "@/services/assetService";
import { useActiveAsset } from "./useActiveAsset";
import { useActiveOrg } from "./useActiveOrg";
import { useActiveProject } from "./useActiveProject";

export const useAssetScope = (): AssetScope => ({
  organization: useActiveOrg().slug,
  projectSlug: useActiveProject()!.slug,
  assetSlug: useActiveAsset()!.slug,
});
