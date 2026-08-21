// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { config } from "../config";

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
      ...init?.headers,
    },
    credentials: "include",
  });
};
