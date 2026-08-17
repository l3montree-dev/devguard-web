import { NextRequest, NextResponse } from "next/server";
import { createOryMiddleware } from "@ory/nextjs/middleware";
import oryConfig from "./ory.config";
import { rewriteFlow } from "./types/auth";

const proxyToOry = createOryMiddleware(oryConfig);

export async function proxy(request: NextRequest) {
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
