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

import { getApiClientFromContext } from "@/services/devGuardApi";
import { AssetVersionDTO } from "@/types/api/api";
import { GetServerSidePropsContext } from "next";
import { HttpError } from "./middleware";

export async function withAssetVersion(ctx: GetServerSidePropsContext) {
  // get the devGuardApiClient
  const devGuardApiClient = getApiClientFromContext(ctx);

  const organization = ctx.params?.organizationSlug;
  const projectSlug = ctx.params?.projectSlug;
  const assetSlug = ctx.params?.assetSlug;
  const assetVersionSlug = ctx.params?.assetVersionSlug;

  // get the organization
  const r = await devGuardApiClient(
    "/organizations/" +
      organization +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/refs/" +
      assetVersionSlug,
  );

  if (!r.ok) {
    throw new HttpError({
      redirect: {
        destination: "/" + organization + "/projects/" + projectSlug,
        permanent: false,
      },
    });
  }
  // parse the organization
  const assetVersion: AssetVersionDTO = await r.json();
  return assetVersion;
}
