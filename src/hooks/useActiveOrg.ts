import { useRouter } from "next/router";
import { useStore } from "../zustand/globalStoreProvider";
import { OrganizationDTO } from "@/types/api/api";

export function useActiveOrg(): OrganizationDTO {
  const slug = useRouter().query.organizationSlug as string;

  return useStore((s) => {
    // should only be used in organization slug pages
    // an organization cant be undefined in this subrouter - see the applied middleware
    return s.organizations.find((o) => o.slug === slug)!;
  });
}
