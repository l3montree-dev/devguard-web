// Copyright (C) 2024 Tim Bastin, l3montree GmbH
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License

import { AssetVersionDTO } from "@/types/api/api";
import { getApiClientInAppRouter } from "../services/devGuardApiAppRouter";
import { HttpError } from "./http-error";

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
