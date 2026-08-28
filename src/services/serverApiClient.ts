// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

// Server-only half of the API transport. Kept apart from apiClient.ts because
// importing next/headers into a module a client component reaches breaks the
// build.

import { cookies } from "next/headers";

import { config } from "@/config";
import { serverClient, type DevGuardClient } from "@/services/apiClient";

const orySession = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("ory_kratos_session")?.value;
};

export const getServerClient = async (): Promise<DevGuardClient> =>
  serverClient(await orySession());

// Raw transport for file downloads (SBOM/VEX XML, PDF reports). Not the
// generated client: openapi-fetch parses the body by content type, while these
// routes must hand the untouched stream to NextResponse.
export const streamFromApi = async (path: string): Promise<Response> =>
  fetch(config.devGuardApiUrl + "/api/v1" + path, {
    headers: { Cookie: `ory_kratos_session=${await orySession()}` },
    credentials: "include",
  });

// Same, for route handlers that already hold the incoming Request.
export const streamFromApiWithRequest = (
  request: Request,
  path: string,
): Promise<Response> =>
  fetch(config.devGuardApiUrl + "/api/v1" + path, {
    headers: { Cookie: request.headers.get("cookie") ?? "" },
    credentials: "include",
  });
