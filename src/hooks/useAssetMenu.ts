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
  ScaleIcon,
  ShareIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { useActiveAsset } from "./useActiveAsset";
import { useActiveAssetVersion } from "./useActiveAssetVersion";
import { useCurrentUser } from "./useCurrentUser";

// along with this program.  If not, see <https://www.gnu.org/licenses/>.
export const useAssetMenu = () => {
  const router = useRouter();
  const orgSlug = router.query.organizationSlug as string;
  const projectSlug = router.query.projectSlug as string;
  const assetSlug = router.query.assetSlug as string;

  const loggedIn = useCurrentUser();
  const assetVersion = useActiveAssetVersion();
  const activeAsset = useActiveAsset();

  //TODO: Fix this
  const assetVersionSlug = assetVersion?.slug ?? "main";
  let menu = [
    {
      title: "Security Control Center",
      href:
        "/" +
        orgSlug +
        "/projects/" +
        projectSlug +
        "/assets/" +
        assetSlug +
        "/",
      Icon: ShieldCheckIcon,
      isActive:
        router.pathname ===
        "/[organizationSlug]/projects/[projectSlug]/assets/[assetSlug]",
    },
  ];

  if ((activeAsset?.refs.length ?? 0) > 0) {
    menu.unshift({
      title: "Overview",
      href:
        "/" +
        orgSlug +
        "/projects/" +
        projectSlug +
        "/assets/" +
        assetSlug +
        "/refs/" +
        assetVersionSlug,
      Icon: ChartBarSquareIcon,
      isActive:
        router.pathname ===
        "/[organizationSlug]/projects/[projectSlug]/assets/[assetSlug]/refs/[assetVersionSlug]",
    });

    menu = menu.concat([
      {
        title: "Risk handling",
        href:
          "/" +
          orgSlug +
          "/projects/" +
          projectSlug +
          "/assets/" +
          assetSlug +
          "/refs/" +
          assetVersionSlug +
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
          "/refs/" +
          assetVersionSlug +
          "/dependency-graph",
        Icon: ShareIcon,
        isActive: router.pathname.includes("dependency-graph"),
      },
      {
        title: "Compliance",
        href:
          "/" +
          orgSlug +
          "/projects/" +
          projectSlug +
          "/assets/" +
          assetSlug +
          "/refs/" +
          assetVersionSlug +
          "/compliance",
        Icon: ScaleIcon,
        isActive: router.pathname.includes("compliance"),
      },
    ]);
  }

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
        isActive:
          router.pathname ===
          "/[organizationSlug]/projects/[projectSlug]/assets/[assetSlug]/settings",
      },
    ]);
  }
  return menu;
};
