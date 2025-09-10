import { useSession } from "../context/SessionContext";
import { OrganizationDTO } from "../types/api/api";
import { NO_STORE_AVAILABLE, useStore } from "../zustand/globalStoreProvider";

export default function useOrganizations(): OrganizationDTO[] {
  const orgs = useStore((s) => {
    return s.organizations || [];
  });

  const session = useSession();
  if (orgs === NO_STORE_AVAILABLE) {
    return session.organizations;
  }
  return orgs;
}
