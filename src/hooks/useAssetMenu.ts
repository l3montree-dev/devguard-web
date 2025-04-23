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
import { AssetDTO, AssetVersionDTO } from "@/types/api/api";
import { CodeIcon } from "lucide-react";

export const getDefaultAssetVersionSlug = (asset: AssetDTO) => {
  // if we know the default branch - get that one
  const defaultVersion = asset.refs.find((ref) => ref.defaultBranch);
  if (defaultVersion) {
    return defaultVersion.slug;
  }
  // if we don't know the default branch - get the first one
  if (asset.refs.length > 0) {
    return asset.refs[0].slug;
  }
  return "";
};

export const getAssetVersionSlug = (
  asset: AssetDTO,
  assetVersion?: AssetVersionDTO,
): string => {
  if (!assetVersion) {
    return getDefaultAssetVersionSlug(asset);
  }

  // if the assetVersion is defined, we should use that slug - since the user
  // already navigated to that version - therefore it is set.
  // BUT make sure, that the assetVersion corresponds to the asset
  if (assetVersion.assetId === asset.id) {
    return assetVersion.slug;
  }

  // get the default asset version slug
  return getDefaultAssetVersionSlug(asset);
};

// along with this program.  If not, see <https://www.gnu.org/licenses/>.
export const useAssetMenu = () => {
  const router = useRouter();
  const orgSlug = router.query.organizationSlug as string;
  const projectSlug = router.query.projectSlug as string;
  const assetSlug = router.query.assetSlug as string;

  const loggedIn = useCurrentUser();
  const assetVersion = useActiveAssetVersion();
  const activeAsset = useActiveAsset();

  const assetVersionSlug = getAssetVersionSlug(activeAsset!, assetVersion);

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
        title: "Dependency Risk-Handling",
        href:
          "/" +
          orgSlug +
          "/projects/" +
          projectSlug +
          "/assets/" +
          assetSlug +
          "/refs/" +
          assetVersionSlug +
          "/dependency-risks",
        Icon: WrenchScrewdriverIcon,
        isActive: router.pathname.includes("dependency-risks"),
      },
      {
        title: "Code Risk-Handling",
        href:
          "/" +
          orgSlug +
          "/projects/" +
          projectSlug +
          "/assets/" +
          assetSlug +
          "/refs/" +
          assetVersionSlug +
          "/code-risks",
        Icon: CodeIcon,
        isActive: router.pathname.includes("code-risks"),
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
          "/dependencies",
        Icon: ShareIcon,
        isActive: router.pathname.includes("dependencies"),
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
