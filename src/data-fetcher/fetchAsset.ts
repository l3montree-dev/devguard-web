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

import { AssetDTO } from "@/types/api/api";
import { getApiClientInAppRouter } from "../services/devGuardApiAppRouter";

import { HttpError } from "./http-error";

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
