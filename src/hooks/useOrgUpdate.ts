// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useRouter } from "next/navigation";
import {
  useOrganization,
  useUpdateOrganization,
} from "@/context/OrganizationContext";
import { toast } from "@/lib/toast";
import { patchOrganization } from "@/services/organizationService";
import type { OrganizationDetailsDTO } from "@/types/dto";

export const useOrgUpdate = () => {
  const orgCtx = useOrganization();
  const updateOrgCtx = useUpdateOrganization();
  const router = useRouter();
  const org = orgCtx.organization as OrganizationDetailsDTO;

  return async (data: Partial<OrganizationDetailsDTO>) => {
    let updated: OrganizationDetailsDTO;
    try {
      updated = (await patchOrganization(org.slug, {
        ...data,
        numberOfEmployees: data.numberOfEmployees
          ? Number(data.numberOfEmployees)
          : undefined,
      })) as OrganizationDetailsDTO;
    } catch {
      toast.error("Could not update organization");
      return false;
    }

    if (updated.slug !== org.slug) {
      toast("Success", {
        description: "Organization updated - redirecting to new page...",
      });
      setTimeout(() => router.push(`/${updated.slug}/settings`), 2000);
    } else {
      toast("Success", { description: "Organization updated" });
      updateOrgCtx({ ...orgCtx, organization: updated });
    }
    return true;
  };
};
