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
import {
  ChartBarSquareIcon,
  CogIcon,
  ListBulletIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";
import { ContainerIcon } from "lucide-react";
import { useProject } from "../context/ProjectContext";
import { useCurrentUser } from "./useCurrentUser";
import useDecodedParams from "./useDecodedParams";
import useDecodedPathname from "./useDecodedPathname";
import { useCurrentUserRole } from "./useUserRole";

export const useProjectMenu = () => {
  const params = useDecodedParams();
  const project = useProject()!;
  const pathname = useDecodedPathname();
  const orgSlug = params?.organizationSlug as string;
  const projectSlug = params?.projectSlug as string;
  const currentUserRole = useCurrentUserRole();

  const loggedIn = useCurrentUser();

  const menu = [
    {
      title: "Overview",
      href: "/" + orgSlug + "/projects/" + projectSlug + "/overview",
      Icon: ChartBarSquareIcon,
      isActive: pathname === `/${orgSlug}/projects/${projectSlug}/overview`,
    },
    {
      title: "Releases",
      href: "/" + orgSlug + "/projects/" + projectSlug + "/releases",
      Icon: ContainerIcon,
    },
    {
      title: project.externalEntityProviderId
        ? "Repositories"
        : "Subgroups & Repositories",
      href: "/" + orgSlug + "/projects/" + projectSlug,
      Icon: ListBulletIcon,
      isActive: pathname === `/${orgSlug}/projects/${projectSlug}`,
    },
  ];
  if (loggedIn) {
    menu.push({
      title: "Compliance",
      href: "/" + orgSlug + "/projects/" + projectSlug + "/compliance",
      Icon: ScaleIcon,
    });

    if (
      currentUserRole === UserRole.Owner ||
      currentUserRole === UserRole.Admin
    ) {
      menu.push({
        title: "Settings",
        href: "/" + orgSlug + "/projects/" + projectSlug + "/settings",
        Icon: CogIcon,
      });
    }
  }
  return menu;
};
