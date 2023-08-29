// Copyright (C) 2023 Tim Bastin, l3montree UG (haftungsbeschränkt)
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

import { Session } from "@ory/client";
import { GetServerSidePropsContext } from "next";
import { getApiClientFromContext } from "../services/flawFixApi";
import { OrganizationDTO } from "../types/api";
import { User } from "../types/auth";
import { addToInitialZustandState } from "../zustand/initialState";

export function withOrganization(
  next: (
    session: Omit<Session, "identity"> & { identity: User },
    organization: OrganizationDTO,
    ctx: GetServerSidePropsContext,
  ) => any,
) {
  return async (
    session: Omit<Session, "identity"> & { identity: User },
    ctx: GetServerSidePropsContext,
  ) => {
    // get the param from context
    const organizationId = ctx.params?.organizationId;
    if (!organizationId) {
      return {
        notFound: true,
      };
    }

    // get the flawFixApiClient
    const flawFixApiClient = getApiClientFromContext(ctx);

    // get the organization
    const organization = await flawFixApiClient(
      "/organizations/" + organizationId,
    ).then((resp) => resp.json());

    // call the initial endpoint with the latest information available
    const resp = await next(session, organization, ctx);

    // add the organization to the initial zustand state
    return addToInitialZustandState(resp, {
      organization,
    });
  };
}
