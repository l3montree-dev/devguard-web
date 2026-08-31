// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import createClient from "openapi-fetch";
import type { Client } from "openapi-fetch";
import { signAdminRequest } from "@/services/adminRequestSigning";
import type { paths } from "@/types/api/generated";

export type DevGuardClient = Client<paths>;

export const TUNNEL_BASE_URL = "/api/devguard-tunnel/api/v1";

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
    this.name = "ApiError";
    this.status = status;
  }
}

export const readErrorMessage = async (resp: Response): Promise<string> => {
  const fallback = resp.statusText || `HTTP ${resp.status}`;
  const text = await resp.text().catch(() => "");

  try {
    const json = JSON.parse(text);
    return (typeof json === "string" ? json : json?.message) || fallback;
  } catch {
    return (text.length < 500 && text) || fallback;
  }
};

export const browserClient: DevGuardClient = createClient<paths>({
  baseUrl: TUNNEL_BASE_URL,
  credentials: "include",
  headers: { "Content-Type": "application/json" },
});

// Instance admin auth is signature based, not cookie based.
export const adminClient = (key: CryptoKey): DevGuardClient => {
  const client = createClient<paths>({
    baseUrl: TUNNEL_BASE_URL,
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
    throw new ApiError(`${response.status} ${response.url}`, response.status);
  }
  return data as T;
};

// --- raw transports: only for what the generated client cannot express ---

// Dynamic filterQuery keys, multipart uploads, blob downloads and 204-with-no-
// body endpoints. Everything else goes through browserClient.
export const apiFetch = (path: string, init?: RequestInit): Promise<Response> =>
  fetch(TUNNEL_BASE_URL + path, {
    ...init,
    headers: {
      // FormData sets its own Content-Type, including the multipart boundary.
      ...(init?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
    credentials: "include",
  });

// Same, signed instead of cookie authenticated. The body is typed as a string
// because it has to be signed verbatim.
export const adminFetch = async (
  path: string,
  key: CryptoKey,
  init?: Omit<RequestInit, "body"> & { body?: string },
): Promise<Response> => {
  const url = TUNNEL_BASE_URL + path;
  const method = init?.method ?? "GET";
  const signed = await signAdminRequest(url, method, init?.body, key);

  return fetch(url, {
    ...init,
    method,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
      ...signed,
    },
    credentials: "omit",
  });
};

const DOWNLOAD_TIMEOUT_MS = 60 * 8 * 1000;

// Saves an API response as a file (SBOM/VEX documents, PDF reports).
export const downloadFile = async (path: string, fileName: string) => {
  const response = await apiFetch(path, {
    method: "GET",
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  const url = window.URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
