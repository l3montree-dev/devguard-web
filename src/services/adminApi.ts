// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { config } from "../config";
import { signAdminRequest } from "./admin-request-signing";
import { parseSSEStream, type SSEEvent } from "../lib/sse";

/**
 * Create an API client for instance admin requests.
 * All requests are HTTP-signed.
 * Requests go through the devguard-tunnel proxy which forwards the signing headers.
 */
export const adminBrowserApiClient = async (
  input: string,
  key: CryptoKey,
  init?: RequestInit,
  prefix = "/api/v1",
): Promise<Response> => {
  const url = config.frontendUrl + "/api/devguard-tunnel" + prefix + input;

  const method = init?.method ?? "GET";
  // Only string bodies are supported
  if (init?.body !== undefined && typeof init.body !== "string") {
    throw new Error(
      "adminBrowserApiClient only supports string request bodies",
    );
  }
  const body: string | undefined =
    typeof init?.body === "string" ? init.body : undefined;

  const sigHeaders = await signAdminRequest(url, method, body, key);

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

/**
 * SSE event payload from daemon trigger endpoints.
 */
export interface AdminDaemonSSEEvent {
  event: "log" | "done" | "error";
  data: string;
}

/**
 * Error subclass carrying the HTTP status code from a failed admin API call.
 */
export class AdminAPIError extends Error {
  public readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminAPIError";
    this.status = status;
  }
}

/**
 * Extract a human-readable message from a failed admin response.
 */
async function extractErrorMessage(resp: Response): Promise<string> {
  const fallback = resp.statusText || `HTTP ${resp.status}`;
  const text = await resp.text().catch(() => "");

  try {
    // The Echo error handler sends `he.Message` as JSON: a bare string or
    // an object with a `message` field.
    const json = JSON.parse(text);
    return (typeof json === "string" ? json : json?.message) || fallback;
  } catch {
    // Not JSON – use the raw body only if it's short enough to be a message.
    return (text.length < 500 && text) || fallback;
  }
}

/**
 * Trigger an admin daemon endpoint that returns an SSE stream.
 */
export async function adminSSETrigger(
  input: string,
  key: CryptoKey,
  onEvent: (evt: AdminDaemonSSEEvent) => void,
  body?: string,
): Promise<void> {
  const resp = await adminBrowserApiClient(input, key, {
    method: "POST",
    body,
    headers: body ? { "Content-Type": "application/json" } : undefined,
  });

  if (!resp.ok) {
    throw new AdminAPIError(await extractErrorMessage(resp), resp.status);
  }
  if (!resp.body) {
    throw new Error("No response body");
  }

  await parseSSEStream(resp.body, (evt: SSEEvent) =>
    onEvent({
      event: evt.event as AdminDaemonSSEEvent["event"],
      data: evt.data,
    }),
  );
}
