// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import {
  useOrganization,
  useUpdateOrganization,
} from "@/context/OrganizationContext";
import type { OrganizationDetailsDTO } from "@/types/dto";

export const usePatchOrgContext = () => {
  const orgCtx = useOrganization();
  const updateOrgCtx = useUpdateOrganization();
  const org = orgCtx.organization as OrganizationDetailsDTO;

  return [
    org,
    (patch: Partial<OrganizationDetailsDTO>) =>
      updateOrgCtx({ ...orgCtx, organization: { ...org, ...patch } }),
  ] as const;
};
