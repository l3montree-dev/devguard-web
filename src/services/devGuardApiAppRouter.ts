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
import { cookies } from "next/headers";
import { getApiClientFromCookies } from "./devGuardApi";

export const getApiClientInAppRouter = async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("ory_kratos_session");
  return getApiClientFromCookies(sessionCookie?.value);
};

export const getApiClientInRouteHandler = (request: Request) => {
  const cookieHeader = request.headers.get("cookie") || "";
  const sessionCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("ory_kratos_session="));
  const sessionCookieValue = sessionCookie
    ? sessionCookie.split("=")[1]
    : undefined;
  return getApiClientFromCookies(sessionCookieValue);
};
