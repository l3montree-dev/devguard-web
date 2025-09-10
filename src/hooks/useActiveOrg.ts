import { OrganizationDetailsDTO } from "@/types/api/api";
import { useOrganization } from "../context/OrganizationContext";
import { noStoreAvailable, useStore } from "../zustand/globalStoreProvider";

export function useActiveOrg(): OrganizationDetailsDTO {
  const org = useStore((s) => {
    // should only be used in organization slug pages
    // an organization cant be undefined in this subrouter - see the applied middleware
    return s.organization;
  });
  const contextOrg = useOrganization();
  if (noStoreAvailable(org)) {
    return contextOrg.organization;
  }
  return org;
}
