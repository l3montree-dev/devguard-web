// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { AssetVersionScope } from "@/hooks/useAssetVersionStats";
import { browserClient, unwrap } from "@/services/apiClient";

export const refreshComponentLicenses = async (scope: AssetVersionScope) =>
  unwrap(
    await browserClient.POST(
      "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/components/licenses/refresh/",
      { params: { path: scope } },
    ),
  );

export const overwriteComponentLicense = async (
  scope: AssetVersionScope,
  componentPurl: string,
  finalLicenseDecision: string,
) =>
  unwrap(
    await browserClient.POST(
      "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/license-risks",
      {
        params: { path: scope },
        body: { componentPurl, finalLicenseDecision },
      },
    ),
  );
