// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import {
  ChartBarSquareIcon,
  CogIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import { ContainerIcon, FolderSearch, ShieldCheck } from "lucide-react";
import { useProject } from "../context/ProjectContext";
import useDecodedParams from "./useDecodedParams";
import useDecodedPathname from "./useDecodedPathname";
import { isAdmin, isMember, useCurrentUserRole } from "./useUserRole";

export const useProjectMenu = () => {
  const params = useDecodedParams();
  const project = useProject()!;
  const pathname = useDecodedPathname();
  const orgSlug = params?.organizationSlug as string;
  const projectSlug = params?.projectSlug as string;
  const currentUserRole = useCurrentUserRole();

  const menu = [];

  if (isMember(currentUserRole)) {
    menu.push(
      {
        title: "Overview",
        href: "/" + orgSlug + "/projects/" + projectSlug + "/overview",
        Icon: ChartBarSquareIcon,
        isActive: pathname.startsWith(
          `/${orgSlug}/projects/${projectSlug}/overview`,
        ),
        testId: "nav-group-overview",
      },
      {
        title: "Releases",
        href: "/" + orgSlug + "/projects/" + projectSlug + "/releases",
        Icon: ContainerIcon,
        isActive: pathname === `/${orgSlug}/projects/${projectSlug}/releases`,
        testId: "nav-group-releases",
      },
    );
  }

  menu.push({
    title: project.externalEntityProviderId
      ? "Repositories"
      : "Subgroups & Repositories",
    href: "/" + orgSlug + "/projects/" + projectSlug,
    Icon: ListBulletIcon,
    isActive: pathname === `/${orgSlug}/projects/${projectSlug}`,
    testId: "nav-group-subgroups-repositories",
  });

  menu.push({
    title: "Compliance Postures",
    href: "/" + orgSlug + "/projects/" + projectSlug + "/compliance-postures",
    Icon: ShieldCheck,
    isActive: pathname.startsWith(
      `/${orgSlug}/projects/${projectSlug}/compliance-postures`,
    ),
    testId: "nav-group-compliance-postures",
  });

  if (isAdmin(currentUserRole)) {
    menu.push(
      ...[
        {
          title: "Package Search",
          href:
            "/" + orgSlug + "/projects/" + projectSlug + "/dependency-search",
          Icon: FolderSearch,
          isActive:
            pathname ===
            `/${orgSlug}/projects/${projectSlug}/dependency-search`,
          testId: "nav-group-package-search",
        },
        {
          title: "Settings",
          href: "/" + orgSlug + "/projects/" + projectSlug + "/settings",
          Icon: CogIcon,
          isActive: pathname === `/${orgSlug}/projects/${projectSlug}/settings`,
          testId: "nav-group-settings",
        },
      ],
    );
  }

  return menu;
};
