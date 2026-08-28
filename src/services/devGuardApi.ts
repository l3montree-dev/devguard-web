// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

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
