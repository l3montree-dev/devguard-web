// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

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
