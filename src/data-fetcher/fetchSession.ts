// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { User } from "@/types/auth";
import { getServerSession } from "@ory/nextjs/app";

export async function fetchSession() {
  const session = await getServerSession();
  return session as { identity: User } | null;
}
