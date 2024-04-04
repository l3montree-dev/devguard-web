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
import { ProjectDTO } from "@/types/api/api";

export function withProject(
  next: (
    ctx: GetServerSidePropsContext,
    session: Omit<Session, "identity"> & { identity: User },
    initialState: InitialState & {
      project: ProjectDTO;
    },
  ) => any,
) {
  return async (
    ctx: GetServerSidePropsContext,
    session: Omit<Session, "identity"> & { identity: User },
    initialState: InitialState,
  ) => {
    // get the flawFixApiClient
    const flawFixApiClient = getApiClientFromContext(ctx);

    const organization = ctx.params?.organizationSlug;
    const projectSlug = ctx.params?.projectSlug;
    // get the organization
    const r = await flawFixApiClient(
      "/organizations/" + organization + "/projects/" + projectSlug,
    );

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
    const project = await r.json();

    // call the initial endpoint with the latest information available
    const resp = await next(ctx, session, {
      ...initialState,
      project,
    });

    // add the organization to the initial zustand state
    return addToInitialZustandState(resp, {
      project,
    });
  };
}
