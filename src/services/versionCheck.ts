// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Checks the latest DevGuard release from GitHub and compares it against
 * the running instance version (a `git describe` string like "v1.0.1-4-g93f141ee").
 */

import type { VersionCheckResult } from "@/types/view/admin";

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

const GITHUB_RELEASES_API =
  "https://api.github.com/repos/l3montree-dev/devguard/releases/latest";

/**
 * Fetch the latest DevGuard release from GitHub and compare it against
 * the running instance version string.
 */
export async function checkForUpdate(
  currentVersion: string,
): Promise<VersionCheckResult> {
  // Runs in the client - fetches once per page load
  const res = await fetch(GITHUB_RELEASES_API, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (!res.ok) {
    throw new Error(`GitHub API responded with ${res.status}`);
  }

  const data = (await res.json()) as { tag_name: string; html_url: string };
  const latestTag = data.tag_name;
  const latestUrl = data.html_url;

  const currentParsed = parseSemver(baseTag(currentVersion));
  const latestParsed = parseSemver(latestTag);

  // If we can't parse either version, be conservative and say no update
  const updateAvailable =
    currentParsed && latestParsed
      ? compareSemverTuple(currentParsed, latestParsed) < 0
      : false;

  return {
    latestVersion: latestTag,
    latestUrl,
    updateAvailable,
  };
}
