// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { NextRequest, NextResponse } from "next/server";
import { createOryMiddleware } from "@ory/nextjs/middleware";
import oryConfig from "./ory.config";
import { rewriteFlow } from "./utils/auth";

const proxyToOry = createOryMiddleware(oryConfig);

// Ory starts a flow by redirecting to /self-service/<type>/browser when ?flow is
// missing. It does that from getLoginFlow(), which runs inside the page's
// <Suspense> - by then the shell has flushed, so Next downgrades the redirect to
// a client-side navigation: the page paints, then leaves again. Redirecting here
// keeps it a real 307, before anything renders.
// /registration is intentionally absent - its page guards on
// config.registrationEnabled first, and that must not be bypassed.
const flowTypeByPathname: Record<string, string> = {
  "/login": "login",
  "/recovery": "recovery",
  "/verification": "verification",
};

export async function proxy(request: NextRequest) {
  const flowType = flowTypeByPathname[request.nextUrl.pathname];
  if (flowType && !request.nextUrl.searchParams.has("flow")) {
    const target = new URL(`/self-service/${flowType}/browser`, request.url);
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target);
  }

  const response = await proxyToOry(request);

  if (!request.nextUrl.pathname.startsWith("/self-service/registration")) {
    return response;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return response;
  }

  const body = await response.json();
  const rewritten = body?.ui?.nodes ? rewriteFlow(body) : body;

  return NextResponse.json(rewritten, {
    status: response.status,
    headers: response.headers,
  });
}

export const config = {
  matcher: [
    "/login",
    "/registration",
    "/recovery",
    "/verification",
    "/user-settings",
    "/self-service/:path*",
    "/sessions/:path*",
    "/.well-known/ory/:path*",
  ],
};
