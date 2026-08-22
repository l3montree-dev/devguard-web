// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { AssetVersionDTO } from "@/types/api/api";
import { getApiClientInAppRouter } from "../services/devGuardApiAppRouter";
import { HttpError } from "./httpError";

export async function fetchAssetVersion(
  orgSlug: string,
  projectSlug: string,
  assetSlug: string,
  assetVersionSlug: string,
) {
  const devGuardApiClient = await getApiClientInAppRouter();

  const url = `/organizations/${decodeURIComponent(orgSlug)}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}`;

  const r = await devGuardApiClient(url);

  if (!r.ok) {
    throw new HttpError("Asset version not found", {
      statusCode: 404,
      title: "Asset Version Not Found",
      description:
        "The asset version you're looking for doesn't exist or has been removed.",
      homeLink: `/${orgSlug}/projects/${projectSlug}/assets/${assetSlug}`,
    });
  }
  // parse the organization
  const assetVersion: AssetVersionDTO = await r.json();
  return assetVersion;
}
