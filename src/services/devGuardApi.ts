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
import { config } from "../config";

export const getApiClientFromContext = (ctx: GetServerSidePropsContext) => {
  const { req } = ctx;

  return getApiClientFromRequest(req);
};

export const getApiClientFromRequest = (req: {
  cookies: Partial<{
    [key: string]: string;
  }>;
}) => {
  const orySessionCookie = req.cookies["ory_kratos_session"];
  return (input: string, init?: RequestInit) => {
    return fetch(config.devGuardApiUrl + "/api/v1" + input, {
      ...init,
      headers: {
        ...init?.headers,
        Cookie: `ory_kratos_session=${orySessionCookie}`,
      },
      credentials: "include",
    });
  };
};

export const getApiClientFromCookies = (
  orySessionCookie: string | undefined,
) => {
  return (input: string, init?: RequestInit) => {
    return fetch(config.devGuardApiUrl + "/api/v1" + input, {
      ...init,
      headers: {
        ...init?.headers,
        Cookie: `ory_kratos_session=${orySessionCookie}`,
      },
      credentials: "include",
    });
  };
};

export const browserApiClient = (
  input: string,
  init?: RequestInit,
  prefix = "/api/v1",
) => {
  return fetch("/api/devguard-tunnel" + prefix + input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    credentials: "include",
  });
};

export const multipartBrowserApiClient = (
  input: string,
  init?: RequestInit,
  prefix = "/api/v1",
) => {
  return fetch("/api/devguard-tunnel" + prefix + input, {
    ...init,
    headers: {
      // "Content-Type": "application/json",
      ...init?.headers,
    },
    credentials: "include",
  });
};
