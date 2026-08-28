// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import useSWRImmutable from "swr/immutable";

export interface GlobalNotice {
  description: string;
  updatedAt: string;
}

// Served by this app's own /notice route handler, which reads the announcement
// issue - not the DevGuard API.
export const useGlobalNotice = () => {
  const { data } = useSWRImmutable("/notice", async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) return null;
    const { notice } = (await response.json()) as {
      notice: GlobalNotice | null;
    };
    return notice;
  });

  return data ?? null;
};
