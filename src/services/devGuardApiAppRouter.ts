// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { cookies } from "next/headers";
import { serverClient } from "./apiClient";

export const getServerClientInAppRouter = async () => {
  const cookieStore = await cookies();
  return serverClient(cookieStore.get("ory_kratos_session")?.value);
};
