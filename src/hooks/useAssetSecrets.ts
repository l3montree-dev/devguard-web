// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useApiQuery } from "@/hooks/useApiQuery";
import type { AssetScope } from "@/services/assetService";

export const useAssetSecrets = (scope: AssetScope) =>
  useApiQuery(
    "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/secrets/",
    { params: { path: scope } },
  );
