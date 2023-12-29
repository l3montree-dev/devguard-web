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
import { isAxiosError } from "axios";
import { GetServerSidePropsContext } from "next";
import { ory } from "../services/ory";
import { User } from "../types/auth";

export function withSession(
  next: (
    ctx: GetServerSidePropsContext,
    session: Omit<Session, "identity"> & { identity: User },
  ) => any,
) {
  return async (ctx: GetServerSidePropsContext) => {
    const orySessionCookie = ctx.req.cookies["ory_kratos_session"];
    // get the latest session
    try {
      const session = await ory.toSession(
        {
          cookie: "ory_kratos_session=" + orySessionCookie + ";",
        },
        {
          baseURL: "http://localhost:3000",
        },
      );

      if (!session.data) {
        return {
          redirect: {
            destination: "/login?return_to=" + ctx.resolvedUrl,
            permanent: false,
          },
        };
      }
      // call the initial endpoint with the latest information available
      return next(ctx, session.data as any);
    } catch (e: unknown) {
      if (isAxiosError(e))
        if (e.response?.status === 401) {
          // check if axios error and 401.
          return {
            redirect: {
              destination: "/login?return_to=" + ctx.resolvedUrl,
              permanent: false,
            },
          };
        }

      return {
        redirect: {
          destination: "/login?return_to=" + ctx.resolvedUrl,
          permanent: false,
        },
      };
    }
  };
}
