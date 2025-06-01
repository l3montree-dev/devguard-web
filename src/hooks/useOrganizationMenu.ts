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
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import {
  ChartBarSquareIcon,
  CogIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";

import { useCurrentUser } from "./useCurrentUser";
import { ScaleIcon } from "lucide-react";
import { useActiveOrg } from "./useActiveOrg";

export const useOrganizationMenu = () => {
  const router = useRouter();
  const orgSlug = router.query.organizationSlug as string;
  const loggedIn = useCurrentUser();
  const org = useActiveOrg();
  const menu = [
    {
      title: "Projects",
      href: "/" + orgSlug,
      Icon: ListBulletIcon,
    },
  ];

  if (loggedIn && !org.externalEntityProviderId) {
    return menu.concat([
      {
        title: "Compliance",
        href: "/" + orgSlug + "/compliance",
        Icon: ScaleIcon,
      },
      {
        title: "Settings",
        href: "/" + orgSlug + "/settings",
        Icon: CogIcon,
      },
    ]);
  }
  return menu;
};
