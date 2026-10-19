// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

const DEVGUARD_API_INFO = "https://api.devguard.org/api/v1/info";

export interface InstanceUpdateCheck {
  instance: string;
  latest: string;
  updateAvailable: boolean;
}

function parseMajorMinor(version: string): [number, number] | null {
  const majorMinor = version.split(".").slice(0, 2).join(".");
  const [major, minor] = majorMinor.replace("v", "").split(".").map(Number);
  if (!Number.isInteger(major) || !Number.isInteger(minor)) return null;
  return [major, minor];
}

export async function checkInstanceUpdate(
  instanceVersion: string,
): Promise<InstanceUpdateCheck | null> {
  try {
    const res = await fetch(DEVGUARD_API_INFO);
    if (!res.ok) return null;

    const data = (await res.json()) as { build?: { version?: string } };
    const current = parseMajorMinor(instanceVersion);
    const latest = parseMajorMinor(data.build?.version ?? "");
    if (!current || !latest) return null;

    const updateAvailable =
      current[0] < latest[0] ||
      (current[0] === latest[0] && current[1] < latest[1]);

    return {
      instance: current.join("."),
      latest: latest.join("."),
      updateAvailable,
    };
  } catch {
    return null;
  }
}
