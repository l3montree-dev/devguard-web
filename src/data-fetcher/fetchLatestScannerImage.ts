// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

export async function fetchLatestScannerImage(): Promise<string> {
  const defaultImage = "ghcr.io/l3montree-dev/devguard/scanner:main";
  try {
    const res = await fetch("https://devguard.org/api/latest", {
      next: { revalidate: 3600 },
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
