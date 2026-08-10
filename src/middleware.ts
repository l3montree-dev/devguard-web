import { NextRequest, NextResponse } from "next/server";
import { createOryMiddleware } from "@ory/nextjs/middleware";
import oryConfig from "./ory.config";
import { rewriteFlow } from "./types/auth";

const proxyToOry = createOryMiddleware(oryConfig);

export async function middleware(request: NextRequest) {
  const response = await proxyToOry(request);

  if (!request.nextUrl.pathname.startsWith("/self-service/registration")) {
    return response;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return response;
  }

  const body = await response.json();
  if (!body?.ui?.nodes) {
    return response;
  }

  // On errors, ORy loads form json directly instead of loading it through the component,
  // so we have to apply the rewrite directly on the form 
  return NextResponse.json(rewriteFlow(body), {
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
