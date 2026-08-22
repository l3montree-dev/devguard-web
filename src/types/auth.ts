// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { Identity } from "@ory/client-fetch";

export interface User extends Omit<Identity, "traits"> {
  traits: {
    name:
      | {
          last?: string;
          first?: string;
        }
      | string;
    email: string;
  };
}
