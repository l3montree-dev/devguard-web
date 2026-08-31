// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { ArtifactDTO } from "@/types/dto";
import { getServerClient } from "@/services/serverApiClient";

export async function fetchArtifacts(
  organizationSlug: string,
  projectSlug: string,
  assetSlug: string,
  assetVersionSlug: string,
) {
  const client = await getServerClient();

  const { data, response: r } = await client.GET(
    "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/artifacts/",
    {
      params: {
        path: {
          organization: decodeURIComponent(organizationSlug),
          projectSlug,
          assetSlug,
          assetVersionSlug,
        },
      },
    },
  );

  if (!r.ok) {
    return [];
  }

  // parse the organization
  const artifacts = data as ArtifactDTO[];
  return artifacts;
}
