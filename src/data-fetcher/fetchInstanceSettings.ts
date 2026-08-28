// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { InstanceSettings } from "@/types/dto";
import { getServerClient } from "@/services/serverApiClient";

export async function fetchInstanceSettings(): Promise<
  Partial<InstanceSettings>
> {
  const client = await getServerClient();

  const { data, response: r } = await client.GET("/instance-settings");
  if (!r.ok) {
    return {};
  }

  return data ?? {};
}
