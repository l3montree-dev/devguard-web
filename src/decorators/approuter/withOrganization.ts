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

import { OrganizationDetailsDTO } from "@/types/api/api";
import { GetServerSidePropsContext } from "next";
import { getApiClientInAppRouter } from "../../services/devGuardApiAppRouter";
import { HttpError } from "../http-error";

export const OAUTH2_ERROR = "OAUTH2_ERROR";

export async function withOrganization(organizationSlug: string) {
  // get the devGuardApiClient
  const devGuardApiClient = await getApiClientInAppRouter();

  if (organizationSlug) {
    // get the organization
    const org = await devGuardApiClient(
      "/organizations/" + decodeURIComponent(organizationSlug),
    );

    // if the organization slug starts with an @ it is actually an identity provider
    // there has to be a token in the backend - maybe the user just needs to reauthorize.
    if (!org.ok && (organizationSlug as string).startsWith("@")) {
      // make sure to redirect to the slug base

      return {
        oauth2Error: true,
      };
    }
    if (!org.ok && !(organizationSlug as string).startsWith("@")) {
      console.log("LOGIN REDIRECT", org);
      // it must be an 500
      throw new HttpError({
        redirect: {
          destination: "/login",
          permanent: false,
        },
      });
    }
    // parse the organization
    const organization: OrganizationDetailsDTO = await org.json();

    return organization;
  } else {
    return null;
  }
}
