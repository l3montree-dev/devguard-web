// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

// Server-only half of the API transport

import { config } from "@/config";
import { cookies } from "next/headers";
import { type DevGuardClient } from "@/services/apiClient";
import createClient from "openapi-fetch";
import type { paths } from "@/types/api/generated";

const orySession = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("ory_kratos_session")?.value;
};

const directBaseUrl = () => config.devGuardApiUrl + "/api/v1";

const serverClient = (orySessionCookie: string | undefined): DevGuardClient =>
  createClient<paths>({
    baseUrl: directBaseUrl(),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Cookie: `ory_kratos_session=${orySessionCookie}`,
    },
  });

export const getServerClient = async (): Promise<DevGuardClient> =>
  serverClient(await orySession());

// Raw transport for file downloads (SBOM/VEX XML, PDF reports).
export const streamFromApi = async (path: string): Promise<Response> =>
  fetch(config.devGuardApiUrl + "/api/v1" + path, {
    headers: { Cookie: `ory_kratos_session=${await orySession()}` },
    credentials: "include",
  });

export const streamFromApiWithRequest = (
  request: Request,
  path: string,
): Promise<Response> =>
  fetch(config.devGuardApiUrl + "/api/v1" + path, {
    headers: { Cookie: request.headers.get("cookie") ?? "" },
    credentials: "include",
  });
