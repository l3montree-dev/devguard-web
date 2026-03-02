// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { signAdminRequest } from "./admin-request-signing";

/**
 * Create an API client for instance admin requests.
 * All requests are HTTP-signed with the provided ECDSA P-256 private key.
 * Requests go through the devguard-tunnel proxy which forwards the signing headers.
 */
export const adminBrowserApiClient = async (
  input: string,
  hexPrivateKey: string,
  init?: RequestInit,
  prefix = "/api/v1",
): Promise<Response> => {
  const url =
    typeof window !== "undefined"
      ? window.location.origin + "/api/devguard-tunnel" + prefix + input
      : "/api/devguard-tunnel" + prefix + input;

  const method = init?.method ?? "GET";
  const body =
    typeof init?.body === "string" ? init.body : init?.body ? "" : undefined;

  // Sign the request — produces Signature, Signature-Input, and Content-Digest headers
  const sigHeaders = await signAdminRequest(url, method, body, hexPrivateKey);

  return fetch(url, {
    ...init,
    method,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
      ...sigHeaders,
    },
    // Do NOT send cookies — admin auth is purely signature-based
    credentials: "omit",
  });
};
