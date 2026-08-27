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

// Plain prefixes, checked below via pathname.startsWith() - not Next's
// matcher-pattern syntax, so no ":path*" placeholders here.
const oryPaths = [
  "/login",
  "/registration",
  "/recovery",
  "/verification",
  "/user-settings",
  "/self-service/",
  "/sessions/",
  "/.well-known/ory/",
];

// A literal "@" leading the organization slug (e.g. "/@opencode/...", used
// for the reserved external-identity-provider orgs) collides with something
// in Next's internal dynamic-segment handling: navigating within such an org
// corrupts the client router's cached state on the very next navigation,
// producing a full, uncached re-fetch of the whole route tree (looks like
// the page hard-reloading). Navigating via the equivalent "%40opencode" URL
// does not reproduce it, so redirect every "@..." request to that form -
// unlike a rewrite, this actually changes what the browser's address bar and
// window.location show, which is the part that mattered.
function redirectAtPrefixedOrgSlug(request: NextRequest): NextResponse | null {
  const match = request.nextUrl.pathname.match(/^\/(@[^/]+)(\/.*)?$/);
  if (!match) return null;

  const url = request.nextUrl.clone();
  url.pathname = `/${encodeURIComponent(match[1])}${match[2] ?? ""}`;
  return NextResponse.redirect(url, 307);
}

export async function proxy(request: NextRequest) {
  const orgSlugRedirect = redirectAtPrefixedOrgSlug(request);
  if (orgSlugRedirect) return orgSlugRedirect;

  if (!oryPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }
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
  // Next's documented "match everything except static assets" pattern -
  // "*" alone isn't valid matcher syntax (patterns must start with "/").
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
