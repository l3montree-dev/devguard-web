// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Checks the latest server-cached DevGuard release that was fetched from api.devguard.org and compares it against
 * the running instance version (a `git describe` string like "v1.0.1-4-g93f141ee").
 */

import type { VersionCheckResult } from "@/types/view/admin";
import { fetchLatestDevguardVersion } from "@/data-fetcher/fetchLatestDevguardVersion";

export function withVPrefix(version: string): string {
  return /^v/i.test(version) ? version : `v${version}`;
}

/** Parse a semver-style tag "v1.2.3" → [1, 2, 3]. Returns null on failure. */
function parseSemver(tag: string): [number, number, number] | null {
  const m = tag.match(/^v?(\d+)\.(\d+)\.(\d+)/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/**
 * Extract the base semver tag from a `git describe` output.
 * "v1.0.1-4-g93f141ee" → "v1.0.1"
 * "v1.0.1"             → "v1.0.1"
 */
function baseTag(version: string): string {
  // git describe format: <tag>-<N>-g<hash>  or just <tag>
  const m = version.match(/^(v?\d+\.\d+\.\d+)/);
  return m ? m[1] : version;
}

/**
 * Compare two semver tuples.
 * Returns negative if a < b, 0 if equal, positive if a > b.
 */
function compareSemverTuple(
  a: [number, number, number],
  b: [number, number, number],
): number {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

/**
 * Compare two semver strings like "1.2.3" (an optional leading "v" is allowed).
 * Returns negative if a < b, 0 if equal, positive if a > b, NaN if either fails to parse.
 */
export function compareSemver(a: string, b: string): number {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  if (!pa || !pb) return NaN;
  return compareSemverTuple(pa, pb);
}
const RELEASE_TAG_URL =
  "https://github.com/l3montree-dev/devguard/releases/tag/";

/** "minor" ignores patch releases (for UpdateAvailableDialog)
 * "patch" counts them too (for InstanceTechnicalInfo)
 */
export type UpdateLevel = "minor" | "patch";

/**
 * Cut a version down to major.minor.
 * "v1.16.1-53-g1ae779e6" → "1.16". Returns null on failure.
 */
export function toMinorVersion(version: string): string | null {
  const parsed = parseSemver(baseTag(version));
  return parsed ? `${parsed[0]}.${parsed[1]}` : null;
}

/**
 * Fetch the latest DevGuard version on api.devguard.org that was cached and compare
 * it against the running instance version string.
 */
export async function checkForUpdate(
  currentVersion: string,
  level: UpdateLevel,
): Promise<VersionCheckResult> {
  const latestVersion = await fetchLatestDevguardVersion();
  if (!latestVersion) {
    throw new Error(
      "Could not fetch the latest DevGuard version from api.devguard.org/api/v1/info",
    );
  }

  const latestTag = baseTag(latestVersion);
  const currentParsed = parseSemver(baseTag(currentVersion));
  const latestParsed = parseSemver(latestTag);

  // At "minor" level, make the patch zero so only major and minor are compared
  const atLevel = (v: [number, number, number]): [number, number, number] =>
    level === "minor" ? [v[0], v[1], 0] : v;

  // If we can't parse either version, be conservative and say no update
  const updateAvailable =
    currentParsed && latestParsed
      ? compareSemverTuple(atLevel(currentParsed), atLevel(latestParsed)) < 0
      : false;

  return {
    latestVersion: latestTag,
    latestUrl: RELEASE_TAG_URL + latestTag,
    updateAvailable,
  };
}
