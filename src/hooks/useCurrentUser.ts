// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useSession } from "../context/SessionContext";

export const useCurrentUser = () => {
  const { session } = useSession();
  return session?.identity;
};
