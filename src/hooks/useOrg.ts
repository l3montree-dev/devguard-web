import { useRouter } from "next/compat/router";
import { useStore } from "../zustand/globalStoreProvider";
import { OrganizationDTO } from "@/types/api/api";

export function useOrg(): OrganizationDTO | undefined {
  const slug = useRouter()?.query.organizationSlug as string;

  return useStore((s) => {
    return s.organizations.find((o) => o.slug === slug);
  });
}
