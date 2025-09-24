import { useSession } from "../context/SessionContext";
import { OrganizationDTO } from "../types/api/api";
import { noStoreAvailable, useStore } from "../zustand/globalStoreProvider";

export default function useOrganizations(): OrganizationDTO[] {
  const orgs = useStore((s) => {
    return s.organizations || [];
  });

  const session = useSession();
  if (noStoreAvailable(orgs)) {
    return session.organizations;
  }
  return orgs;
}
