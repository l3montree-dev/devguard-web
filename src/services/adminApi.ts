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

/**
 * SSE event payload from daemon trigger endpoints.
 */
export interface DaemonSSEEvent {
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
 * Trigger an admin daemon endpoint that returns an SSE stream.
 * Calls `onEvent` for each SSE event received, then resolves when the stream ends.
 * Rejects on HTTP errors (e.g. 429 cooldown) or network failures.
 */
export async function adminSSETrigger(
  input: string,
  hexPrivateKey: string,
  onEvent: (evt: DaemonSSEEvent) => void,
  body?: string,
): Promise<void> {
  const resp = await adminBrowserApiClient(input, hexPrivateKey, {
    method: "POST",
    body,
    headers: body ? { "Content-Type": "application/json" } : undefined,
  });

  if (!resp.ok) {
    let message: string | undefined;
    try {
      const text = await resp.text();
      // The custom Echo error handler sends he.Message directly as JSON,
      // which may be a bare string (e.g. "some message") or an object
      // (e.g. {"message":"..."}). Handle both.
      try {
        const json = JSON.parse(text);
        if (typeof json === "string") {
          message = json;
        } else if (typeof json === "object" && json !== null) {
          message = json.message ?? JSON.stringify(json);
        }
      } catch {
        // Not valid JSON – use the raw body if it looks meaningful
        if (text && text.length < 500) {
          message = text;
        }
      }
    } catch {
      // body unreadable
    }
    throw new AdminAPIError(
      message ?? resp.statusText ?? `HTTP ${resp.status}`,
      resp.status,
    );
  }

  if (!resp.body) {
    throw new Error("No response body");
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Parse SSE lines from buffer
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? ""; // keep incomplete line in buffer

    let currentEvent = "";
    for (const line of lines) {
      if (line.startsWith("event: ")) {
        currentEvent = line.slice(7);
      } else if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (currentEvent) {
          onEvent({
            event: currentEvent as DaemonSSEEvent["event"],
            data,
          });
          currentEvent = "";
        }
      }
    }
  }
}
