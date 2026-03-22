// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Format a byte count into a human-readable string using binary units.
 *
 * @param bytes  - The number of bytes.
 * @param decimals - Number of decimal places (default: 1).
 * @returns A formatted string like "3.2 MiB".
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${units[i]}`;
}

/**
 * Format a duration given in seconds into a compact human-readable string.
 *
 * @param seconds - Total number of seconds.
 * @returns A string like "3d 5h 12m" or "42m".
 */
export function formatDuration(seconds: number): string {
  const d = Math.floor(seconds / 86_400);
  const h = Math.floor((seconds % 86_400) / 3_600);
  const m = Math.floor((seconds % 3_600) / 60);
  const s = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (parts.length === 0) parts.push(`${s}s`);
  return parts.join(" ");
}

/**
 * Format a Unix timestamp (seconds) into a locale-aware date string.
 * If the input is not a valid numeric timestamp it is returned as-is.
 *
 * @param timestamp - A Unix timestamp in seconds (number or numeric string).
 * @param options   - Optional `Intl.DateTimeFormatOptions` overrides.
 * @returns A formatted date string.
 */
export function formatUnixTimestamp(
  timestamp: string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const n = Number(timestamp);
  if (Number.isNaN(n) || n === 0) return String(timestamp);

  return new Date(n * 1000).toLocaleDateString(
    undefined,
    options ?? {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}
