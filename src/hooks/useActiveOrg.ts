// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { OrganizationDetailsDTO } from "@/types/api/api";
import { useOrganization } from "../context/OrganizationContext";

export function useActiveOrg(): OrganizationDetailsDTO {
  const contextOrg = useOrganization();
  return contextOrg?.organization as OrganizationDetailsDTO;
}
