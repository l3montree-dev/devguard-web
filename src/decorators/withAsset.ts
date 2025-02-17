// Copyright (C) 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
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

import { getApiClientFromContext } from "@/services/devGuardApi";
import { AssetDTO, AssetVersionDTO } from "@/types/api/api";
import { GetServerSidePropsContext } from "next";
import { HttpError } from "./middleware";

export async function withAsset(ctx: GetServerSidePropsContext) {
  // get the devGuardApiClient
  const devGuardApiClient = getApiClientFromContext(ctx);

  const organization = ctx.params?.organizationSlug;
  const projectSlug = ctx.params?.projectSlug;
  const assetSlug = ctx.params?.assetSlug;

  const url =
    "/organizations/" +
    organization +
    "/projects/" +
    projectSlug +
    "/assets/" +
    assetSlug;

  // get the organization
  const r = await devGuardApiClient(url);

  if (!r.ok) {
    throw new HttpError({
      redirect: {
        destination:
          "/" + organization + "/projects/" + projectSlug + "/assets/",
        permanent: false,
      },
    });
  }
  // parse the organization
  const asset: AssetDTO = await r.json();

  const assetVersionResp = await devGuardApiClient(url + "/refs");
  if (!assetVersionResp.ok) {
    console.error("Failed to fetch asset versions", assetVersionResp);
  }

  const assetVersions = await assetVersionResp.json();

  let branches: string[] = [];
  let tags: string[] = [];

  for (const assetVersion of assetVersions) {
    if (assetVersion.type === "branch") {
      branches.push(assetVersion.slug);
    } else {
      tags.push(assetVersion.slug);
    }
  }

  asset.branches = branches;
  asset.tags = tags;

  return asset;
}
