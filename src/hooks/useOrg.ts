import { useRouter } from "next/compat/router";
import { noStoreAvailable, useStore } from "../zustand/globalStoreProvider";
import { OrganizationDTO } from "@/types/api/api";
import useOrganizations from "./useOrganizations";

export function useOrg(): OrganizationDTO | undefined {
  const slug = useRouter()?.query.organizationSlug as string;

  const org = useStore((s) => {
    return s.organizations.find((o) => o.slug === slug);
  });
  const contextOrg = useOrganizations();
  if (!noStoreAvailable(org)) {
    return org;
  }
  return contextOrg.find((o) => o.slug === slug);
}
