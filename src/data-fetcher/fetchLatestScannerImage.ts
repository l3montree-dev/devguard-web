// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
"use cache";

import { cacheLife } from "next/cache";
import { config } from "@/config";

export async function fetchLatestScannerImage(): Promise<string> {
  cacheLife("hours");
  const defaultImage = "ghcr.io/l3montree-dev/devguard/scanner:main";
  try {
    const res = await fetch(`${config.devguardWebsiteUrl}/api/latest`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return defaultImage;
    const data = await res.json();

    const scannerImage = data.images?.find(
      (img: { name?: string }) => img.name === "Scanner",
    );
    const manifest = scannerImage?.indexManifests?.find(
      (m: { host?: string }) => m.host === "ghcr.io",
    );

    if (!manifest?.image || !manifest?.digest) return defaultImage;

    return `${manifest.image}@${manifest.digest}`;
  } catch {
    return defaultImage;
  }
}
