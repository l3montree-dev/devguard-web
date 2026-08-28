// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import createClient from "openapi-fetch";
import type { Client } from "openapi-fetch";

import { config } from "@/config";
import { FetcherError } from "@/data-fetcher/fetcher";
import { signAdminRequest } from "@/services/adminRequestSigning";
import type { paths } from "@/types/api/generated";

export type DevGuardClient = Client<paths>;

const BASE_URL = "/api/devguard-tunnel/api/v1";

// The browser never reaches the API host directly - it goes through the
// Next.js tunnel route, which attaches the Ory session.
export const browserClient: DevGuardClient = createClient<paths>({
  baseUrl: BASE_URL,
  credentials: "include",
  headers: { "Content-Type": "application/json" },
});

// Server components and route handlers reach the API host directly and carry
// the Ory session cookie themselves.
export const serverClient = (
  orySessionCookie: string | undefined,
): DevGuardClient =>
  createClient<paths>({
    baseUrl: config.devGuardApiUrl + "/api/v1",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Cookie: `ory_kratos_session=${orySessionCookie}`,
    },
  });

// Instance admin auth is signature based, never cookie based.
export const adminClient = (key: CryptoKey): DevGuardClient => {
  const client = createClient<paths>({
    baseUrl: BASE_URL,
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
  });

  client.use({
    async onRequest({ request }) {
      const body = request.body ? await request.clone().text() : undefined;
      const signed = await signAdminRequest(
        request.url,
        request.method,
        body,
        key,
      );
      for (const [header, value] of Object.entries(signed)) {
        request.headers.set(header, value);
      }
      return request;
    },
  });

  return client;
};

export const unwrap = <T>({
  data,
  response,
}: {
  data?: T;
  response: Response;
}): T => {
  if (!response.ok) {
    throw new FetcherError(
      `${response.status} ${response.url}`,
      response.status,
    );
  }
  return data as T;
};
