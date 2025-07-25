// Copyright (C) 2023 Tim Bastin, l3montree GmbH
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
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { GetServerSidePropsContext } from "next";
import { getApiClientFromContext } from "../services/devGuardApi";
import { HttpError } from "./middleware";
import { OrganizationDTO } from "@/types/api/api";

export async function withOrgs(ctx: GetServerSidePropsContext) {
  // get the devGuardApiClient
  const devGuardApiClient = getApiClientFromContext(ctx);

  // get the organization
  const r = await devGuardApiClient("/organizations/");

  if (!r.ok) {
    console.log("LOGIN REDIRECT", r);
    // it must be an 500
    throw new HttpError({
      redirect: {
        destination: "/login",
        permanent: false,
      },
    });
  }
  // parse the organization
  const organizations: OrganizationDTO[] = await r.json();
  // sort the orgs by name
  organizations.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return organizations;
}
