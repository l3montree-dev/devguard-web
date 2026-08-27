// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { AssetDTO } from "@/types/api/api";
import { getApiClientInAppRouter } from "../services/devGuardApiAppRouter";

import { HttpError } from "./httpError";

export async function fetchAsset(
  organizationSlug: string,
  projectSlug: string,
  assetSlug: string,
) {
  const devGuardApiClient = await getApiClientInAppRouter();

  const url = `/organizations/${decodeURIComponent(organizationSlug)}/projects/${projectSlug}/assets/${assetSlug}`;
  // console.log(url);
  const r = await devGuardApiClient(url);

  if (!r.ok) {
    throw new HttpError(`Failed to fetch asset: ${r.status} ${r.statusText}`, {
      statusCode: r.status,
      title: "Failed to load asset",
      description: `An error occurred while fetching the asset. Please try again later. (${r.status} ${r.statusText})`,
      homeLink: `/${organizationSlug}/projects/${projectSlug}/assets`, // link to the asset list
    });
  }
  // parse the organization
  const asset: AssetDTO = await r.json();
  return asset;
}
