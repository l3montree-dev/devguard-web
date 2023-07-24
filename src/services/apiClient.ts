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

export const getApiClientFromContext = (ctx: GetServerSidePropsContext) => {
  const { req } = ctx;
  const orySessionCookie = req.cookies["ory_kratos_session"];
  return (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, {
      ...init,
      headers: {
        ...init?.headers,
        Cookie: `ory_kratos_session=${orySessionCookie}`,
      },
      credentials: "include",
    });
};
