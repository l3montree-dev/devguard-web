import { OrganizationDetailsDTO } from "@/types/api/api";
import { useOrganization } from "../context/OrganizationContext";

export function useActiveOrg(): OrganizationDetailsDTO {
  const contextOrg = useOrganization();
  return contextOrg?.organization as OrganizationDetailsDTO;
}
