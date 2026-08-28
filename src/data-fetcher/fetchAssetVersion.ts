// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { AssetVersionDTO } from "@/types/dto";
import { getServerClientInAppRouter } from "../services/devGuardApiAppRouter";
import { HttpError } from "./httpError";

export async function fetchAssetVersion(
  orgSlug: string,
  projectSlug: string,
  assetSlug: string,
  assetVersionSlug: string,
) {
  const client = await getServerClientInAppRouter();

  const { data, response: r } = await client.GET(
    "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/",
    {
      params: {
        path: {
          organization: decodeURIComponent(orgSlug),
          projectSlug,
          assetSlug,
          assetVersionSlug,
        },
      },
    },
  );

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
  const assetVersion = data as AssetVersionDTO;
  return assetVersion;
}
