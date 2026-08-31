// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { adminFetch, ApiError, readErrorMessage } from "@/services/apiClient";
import { parseSSEStream } from "@/lib/sse";
import type { SSEEvent } from "@/types/view/sse";
import type { AdminDaemonSSEEvent } from "@/types/view/admin";

/** Triggers an admin daemon endpoint and consumes its SSE stream. */
export async function adminSSETrigger(
  path: string,
  key: CryptoKey,
  onEvent: (evt: AdminDaemonSSEEvent) => void,
  body?: string,
): Promise<void> {
  const resp = await adminFetch(path, key, { method: "POST", body });

  if (!resp.ok) {
    throw new ApiError(await readErrorMessage(resp), resp.status);
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
