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
import { User } from "../types/auth";
import { InitialState } from "../zustand/globalStore";
import { addToInitialZustandState } from "../zustand/initialState";

export function withInitialState(
  next: (
    ctx: GetServerSidePropsContext,
    session: Omit<Session, "identity"> & { identity: User },
    initialState: InitialState,
  ) => any,
) {
  return async (
    ctx: GetServerSidePropsContext,
    session: Omit<Session, "identity"> & { identity: User },
  ) => {
    // get the flawFixApiClient
    const flawFixApiClient = getApiClientFromContext(ctx);

    // get the organization
    const r = await flawFixApiClient("/organizations");

    if (!r.ok) {
      // it must be an 500
      return {
        redirect: {
          destination: "/500",
          permanent: false,
        },
      };
    }
    // parse the organization
    const organizations = await r.json();

    // call the initial endpoint with the latest information available
    const resp = await next(ctx, session, {
      session,
      organizations,
    });

    const initialState: InitialState = {
      session,
      organizations,
    };

    // check if the ctx provides an organizationSlug
    if (ctx.params?.organizationSlug) {
      // check if the organizationSlug is valid
      const organization = organizations.find(
        (o: any) => o.slug === ctx.query.organizationSlug,
      );
      if (organization) {
        initialState.activeOrganization = organization;
      }
    }

    // add the organization to the initial zustand state
    return addToInitialZustandState(resp, initialState);
  };
}
