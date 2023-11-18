import { useRouter } from "next/router";
import { useStore } from "../zustand/globalStoreProvider";

export function useActiveOrg() {
  const slug = useRouter().query.organizationSlug as string;

  return useStore((s) => {
    return s.organizations.find((o) => o.slug === slug);
  });
}
