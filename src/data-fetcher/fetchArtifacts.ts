// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { ArtifactDTO } from "@/types/api/api";
import { getApiClientInAppRouter } from "../services/devGuardApiAppRouter";

export async function fetchArtifacts(
  organizationSlug: string,
  projectSlug: string,
  assetSlug: string,
  assetVersionSlug: string,
) {
  const devGuardApiClient = await getApiClientInAppRouter();

  const url = `/organizations/${decodeURIComponent(organizationSlug)}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/artifacts`;
  // console.log(url);
  const r = await devGuardApiClient(url);

  if (!r.ok) {
    return [];
  }

  // parse the organization
  const artifacts: ArtifactDTO[] = await r.json();
  return artifacts;
}
