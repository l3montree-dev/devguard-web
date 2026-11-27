// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useConfig } from "@/context/ConfigContext";
import { useCurrentUser } from "./useCurrentUser";

export const useIsEmailUnverified = () => {
  const { emailVerificationEnabled } = useConfig();
  const user = useCurrentUser();

  return (
    emailVerificationEnabled &&
    !!user &&
    !user.verifiable_addresses?.some((address) => address.verified)
  );
};
