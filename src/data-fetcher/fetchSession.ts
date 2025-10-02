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

import { ory } from "../services/ory";

import { User } from "@/types/auth";
import { isAxiosError } from "axios";
import { cookies, headers } from "next/headers";
import { HttpError } from "./http-error";

export async function withSession() {
  const c = await cookies();
  const requestedUrl = (await headers()).get("referer") || "/";
  const orySessionCookie = c.get("ory_kratos_session");

  if (!orySessionCookie) {
    return null;
  }
  // get the latest session
  try {
    const session = await ory.toSession(
      {
        cookie: "ory_kratos_session=" + orySessionCookie.value + ";",
      },
      {
        baseURL: "http://localhost:3000",
      },
    );

    if (!session.data) {
      return null;
    }

    // call the initial endpoint with the latest information available
    return session.data as { identity: User };
  } catch (e: unknown) {
    console.error(e);
    if (isAxiosError(e)) {
      if (e.response?.status === 401) {
        return null;
      }
    }
    throw new HttpError({
      redirect: {
        destination: "/login?return_to=" + requestedUrl,
        permanent: false,
      },
    });
  }
}
