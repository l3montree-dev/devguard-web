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
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { UserRole } from "@/types/api/api";
import { CogIcon, ListBulletIcon } from "@heroicons/react/24/outline";
import { ScaleIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useActiveOrg } from "./useActiveOrg";
import { useCurrentUser } from "./useCurrentUser";
import useDecodedParams from "./useDecodedParams";
import { useCurrentUserRole } from "./useUserRole";
import { FolderSearch } from "lucide-react";

export const useOrganizationMenu = () => {
  const pathName = usePathname() || "/";
  const { organizationSlug: orgSlug } = useDecodedParams() as {
    organizationSlug: string;
  };

  const loggedIn = useCurrentUser();
  const currentUserRole = useCurrentUserRole();

  // decode the path name and the org slug
  const decodedPathName = decodeURIComponent(pathName);
  const decodedOrgSlug = decodeURIComponent(orgSlug);

  const org = useActiveOrg();
  const menu = [
    {
      title: "Groups",
      href: "/" + decodedOrgSlug,
      Icon: ListBulletIcon,
      isActive: decodedPathName === "/" + decodedOrgSlug,
    },
  ];

  if (loggedIn && !org.externalEntityProviderId) {
    menu.push({
      title: "Compliance",
      href: "/" + decodedOrgSlug + "/compliance",
      Icon: ScaleIcon,
      isActive: decodedPathName === "/" + decodedOrgSlug + "/compliance",
    });

    if (
      currentUserRole === UserRole.Owner ||
      currentUserRole === UserRole.Admin
    ) {
      menu.push({
        title: "Settings",
        href: "/" + decodedOrgSlug + "/settings",
        Icon: CogIcon,
        isActive: decodedPathName.startsWith(
          "/" + decodedOrgSlug + "/settings",
        ),
      });
    }

    return menu;
  }
  return menu;
};
