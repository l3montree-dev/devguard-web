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

import { GetServerSidePropsContext } from "next";
import { ory } from "../services/ory";
import { User } from "../types/auth";
import { HttpError } from "./middleware";

export async function withSession(ctx: GetServerSidePropsContext) {
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
      throw new HttpError({
        redirect: {
          destination: "/login?return_to=" + ctx.resolvedUrl,
          permanent: false,
        },
      });
    }
    // call the initial endpoint with the latest information available
    return { session: session.data as User };
  } catch (e: unknown) {
    throw new HttpError({
      redirect: {
        destination: "/login?return_to=" + ctx.resolvedUrl,
        permanent: false,
      },
    });
  }
}
