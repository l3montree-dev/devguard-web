// Copyright (C) 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License

import {
  ChartBarSquareIcon,
  CogIcon,
  DocumentMagnifyingGlassIcon,
  ShareIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import useSession from "./useSession";
import { useCurrentUser } from "./useCurrentUser";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

// along with this program.  If not, see <https://www.gnu.org/licenses/>.
export const useAssetMenu = () => {
  const router = useRouter();
  const orgSlug = router.query.organizationSlug as string;
  const projectSlug = router.query.projectSlug as string;
  const assetSlug = router.query.assetSlug as string;
  const loggedIn = useCurrentUser();

  const menu = [
    {
      title: "Overview",
      href: "/" + orgSlug + "/projects/" + projectSlug + "/assets/" + assetSlug,
      Icon: ChartBarSquareIcon,
    },
    {
      title: "Security Control Center",
      href:
        "/" +
        orgSlug +
        "/projects/" +
        projectSlug +
        "/assets/" +
        assetSlug +
        "/security-control-center",
      Icon: ShieldCheckIcon,
    },
    {
      title: "Risk handling",
      href:
        "/" +
        orgSlug +
        "/projects/" +
        projectSlug +
        "/assets/" +
        assetSlug +
        "/risk-handling",
      Icon: WrenchScrewdriverIcon,
      isActive:
        router.pathname.includes("[flawId]") ||
        router.pathname.includes("risk-handling"),
    },
    {
      title: "Dependencies",
      href:
        "/" +
        orgSlug +
        "/projects/" +
        projectSlug +
        "/assets/" +
        assetSlug +
        "/dependency-graph",
      Icon: ShareIcon,
      isActive: router.pathname.includes("dependency-graph"),
    },
  ];

  if (loggedIn) {
    return menu.concat([
      {
        title: "Settings",
        href:
          "/" +
          orgSlug +
          "/projects/" +
          projectSlug +
          "/assets/" +
          assetSlug +
          "/settings",
        Icon: CogIcon,
      },
    ]);
  }
  return menu;
};
