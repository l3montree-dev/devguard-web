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

import { CogIcon, ListBulletIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/compat/router";
import { UserRole } from "@/types/api/api";
import { ScaleIcon } from "lucide-react";
import { useActiveOrg } from "./useActiveOrg";
import { useCurrentUser } from "./useCurrentUser";
import { useCurrentUserRole } from "./useUserRole";

export const useOrganizationMenu = () => {
  const router = useRouter();
  const orgSlug = router?.query.organizationSlug as string;
  const loggedIn = useCurrentUser();
  const currentUserRole = useCurrentUserRole();
  const org = useActiveOrg();
  const menu = [
    {
      title: "Groups",
      href: "/" + orgSlug,
      Icon: ListBulletIcon,
    },
  ];

  if (loggedIn && !org.externalEntityProviderId) {
    menu.push({
      title: "Compliance",
      href: "/" + orgSlug + "/compliance",
      Icon: ScaleIcon,
    });

    if (
      currentUserRole === UserRole.Owner ||
      currentUserRole === UserRole.Admin
    ) {
      menu.push({
        title: "Settings",
        href: "/" + orgSlug + "/settings",
        Icon: CogIcon,
      });
    }

    return menu;
  }
  return menu;
};
