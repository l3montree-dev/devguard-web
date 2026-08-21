// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use server";

import { getLogoutFlow } from "@ory/nextjs/app";

export async function getLogoutUrl() {
  const flow = await getLogoutFlow();
  return flow.logout_url;
}
