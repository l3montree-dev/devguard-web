import { ServerIcon } from "@heroicons/react/24/outline";
import { useStore } from "../zustand/globalStoreProvider";
import { useActiveOrg } from "./useActiveOrg";

export function useMenu() {
  const activeOrg = useActiveOrg();
  const orgs = useStore((state) => state.organizations);
  if (!activeOrg) {
    return orgs.map((org) => ({
      name: org.name,
      href: `/${org.slug}`,
      icon: ServerIcon,
    }));
  }

  return [
    { name: activeOrg.name, href: "/" + activeOrg.slug, icon: ServerIcon },
    // { name: "Members", href: "/members", icon: UserGroupIcon },
    /* {
      name: "Latest Activity",
      href: "/activity",
      icon: SignalIcon,
    },
    { name: "Domains", href: "/domains", icon: GlobeAltIcon },
    {
      name: "Reports",
      href: "/reports",
      icon: ChartBarSquareIcon,
    },
    { name: "Settings", href: "/settings", icon: Cog6ToothIcon }, */
  ];
}
