// Copyright (C) 2024 Tim Bastin, l3montree GmbH
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

import { AssetDTO, AssetVersionDTO, UserRole } from "@/types/api/api";
import { RocketLaunchIcon } from "@heroicons/react/20/solid";
import {
  ChartBarSquareIcon,
  CogIcon,
  ScaleIcon,
  ShareIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { CodeIcon, ScanText, TextSelect } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";
import { useActiveAsset } from "./useActiveAsset";
import { useActiveAssetVersion } from "./useActiveAssetVersion";
import { useCurrentUser } from "./useCurrentUser";
import useDecodedParams from "./useDecodedParams";
import useDecodedPathname from "./useDecodedPathname";
import { useCurrentUserRole } from "./useUserRole";

export const getDefaultAssetVersionSlug = (asset: AssetDTO) => {
  if (!asset.refs || asset.refs.length === 0) {
    return "";
  }

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
  assetVersion: AssetVersionDTO | null | undefined,
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
  const params = useDecodedParams();
  const {
    organizationSlug: orgSlug,
    projectSlug,
    assetSlug,
    assetVersionSlug: existingAssetVersionSlug,
  } = params as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
    assetVersionSlug?: string;
  };

  const pathname = useDecodedPathname();

  const loggedIn = useCurrentUser();
  const assetVersion = useActiveAssetVersion();
  const activeAsset = useActiveAsset();

  const currentUserRole = useCurrentUserRole();

  const assetVersionSlug = existingAssetVersionSlug
    ? existingAssetVersionSlug
    : getAssetVersionSlug(activeAsset!, assetVersion);

  let menu: Array<{
    title: string;
    href: string;
    Icon: ForwardRefExoticComponent<
      Omit<SVGProps<SVGSVGElement>, "ref"> & {
        title?: string;
        titleId?: string;
      } & RefAttributes<SVGSVGElement>
    >;
    isActive: boolean;
  }> = [];

  if ((activeAsset?.refs?.length ?? 0) > 0) {
    menu.unshift({
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
      isActive: pathname.startsWith(
        `/${orgSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/compliance`,
      ),
    });

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
        pathname ===
          `/${orgSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}` ||
        pathname.startsWith(
          `/${orgSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/controls/`,
        ) ||
        pathname ===
          `/${orgSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/events` ||
        pathname ===
          `/${orgSlug}/projects/${projectSlug}/assets/${assetSlug}/refs`,
    });

    menu = menu.concat([
      {
        title: "Artifacts",
        href:
          "/" +
          orgSlug +
          "/projects/" +
          projectSlug +
          "/assets/" +
          assetSlug +
          "/refs/" +
          assetVersionSlug +
          "/artifacts",
        Icon: TextSelect,
        isActive: pathname.includes("artifacts"),
      },
      {
        title: "Code Risks",
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
        isActive: pathname.includes("code-risks"),
      },
      {
        title: "Dependency Risks",
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
        isActive: pathname.includes("dependency-risks"),
      },
      {
        title: "License Risks",
        href:
          "/" +
          orgSlug +
          "/projects/" +
          projectSlug +
          "/assets/" +
          assetSlug +
          "/refs/" +
          assetVersionSlug +
          "/license-risks",
        Icon: ScanText,
        isActive: pathname.includes("license-risks"),
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
        isActive: pathname.includes("dependencies"),
      },
    ]);
  } else {
    menu.unshift({
      title: "Onboarding",
      href: "/" + orgSlug + "/projects/" + projectSlug + "/assets/" + assetSlug,
      Icon: RocketLaunchIcon,
      isActive:
        pathname.startsWith(
          `/${orgSlug}/projects/${projectSlug}/assets/${assetSlug}`,
        ) &&
        pathname !==
          `/${orgSlug}/projects/${projectSlug}/assets/${assetSlug}/settings`,
    });
  }

  if (
    loggedIn &&
    (currentUserRole === UserRole.Owner || currentUserRole === UserRole.Admin)
  ) {
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
          pathname ===
          `/${orgSlug}/projects/${projectSlug}/assets/${assetSlug}/settings`,
      },
    ]);
  }
  return menu;
};
