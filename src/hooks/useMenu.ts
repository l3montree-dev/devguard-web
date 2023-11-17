import {
  RectangleGroupIcon,
  ServerIcon,
  UserGroupIcon,
  SignalIcon,
  GlobeAltIcon,
  ChartBarSquareIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useStore } from "../zustand/globalStoreProvider";

export function useMenu() {
  const activeOrg = useStore((s) => s.activeOrganization);
  if (!activeOrg) return [];

  return [
    { name: activeOrg.name, href: "/", icon: ServerIcon },
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
