// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { AssetVersionScope } from "@/hooks/useAssetVersionStats";
import { useApiQuery } from "@/hooks/useApiQuery";

export const useArtifacts = (scope: AssetVersionScope, enabled = true) =>
  useApiQuery(
    enabled
      ? "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/artifacts/"
      : null,
    { params: { path: scope } },
  );
