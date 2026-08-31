// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { apiFetch, ApiError } from "@/services/apiClient";

// SWR fetcher for the URL-keyed reads that cannot go through the generated
// client (dynamic filterQuery keys).
export const fetcher = <T = any>(
  url: string,
  options?: RequestInit,
): Promise<T> =>
  apiFetch(url, options).then(async (res) => {
    if (!res.ok) {
      throw new ApiError(
        "An error occurred while fetching the data.",
        res.status,
      );
    }

    if (res.status === 204) {
      return null as T;
    }

    return res.json();
  });
