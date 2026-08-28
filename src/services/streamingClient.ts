// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { cookies } from "next/headers";

import { config } from "@/config";

// Raw transport for file downloads (SBOM/VEX XML, PDF reports). Deliberately
// not the generated client: openapi-fetch parses the body by content type,
// while these routes must hand the untouched stream to NextResponse.
export const streamFromApi = async (path: string): Promise<Response> => {
  const cookieStore = await cookies();
  const session = cookieStore.get("ory_kratos_session")?.value;

  return fetch(config.devGuardApiUrl + "/api/v1" + path, {
    headers: { Cookie: `ory_kratos_session=${session}` },
    credentials: "include",
  });
};

// Same, for route handlers that already hold the incoming Request.
export const streamFromApiWithRequest = (
  request: Request,
  path: string,
): Promise<Response> =>
  fetch(config.devGuardApiUrl + "/api/v1" + path, {
    headers: { Cookie: request.headers.get("cookie") ?? "" },
    credentials: "include",
  });
