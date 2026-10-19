// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
"use cache";

import { cacheLife } from "next/cache";

// Fetching only from api.devguard.org cause it's always the latest stable release,
// not from config.devguardApiUrlPublicInternet, that is this instance's own API!
const DEVGUARD_API_INFO = "https://api.devguard.org/api/v1/info";

/** Fetches latest released version from api.devguard.org/api/v1/info and caches it server-side.
 * On success, revalidates after 24h, expires after 1 week.
 * On failure can temporarily be null and caches only for up to an hour,
 * so in restricted networks it only errors maximum 24 times.
 * */
export async function fetchLatestDevguardVersion(): Promise<string | null> {
  try {
    console.log("fetching latest version");
    const res = await fetch(DEVGUARD_API_INFO, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      throw new Error(`api.devguard.org responded with ${res.status}`);
    }
    const data = (await res.json()) as { build?: { version?: string } };
    const version = data.build?.version;
    if (!version) {
      throw new Error("api.devguard.org returned no build.version");
    }
    cacheLife("days");
    return version;
  } catch (error) {
    console.warn("could not fetch the latest DevGuard version:", error);
    cacheLife("hours");
    return null;
  }
}
