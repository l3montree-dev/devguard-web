// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { CogIcon, ListBulletIcon } from "@heroicons/react/24/outline";
import { FolderSearch, ShieldCheck } from "lucide-react";
import { useProject } from "../context/ProjectContext";
import useDecodedParams from "./useDecodedParams";
import useDecodedPathname from "./useDecodedPathname";
import { ThinBrickWallFireIcon } from "./useOrganizationMenu";
import { isAdmin, useCurrentUserRole } from "./useUserRole";

export const useProjectMenu = () => {
  const params = useDecodedParams();
  const project = useProject()!;
  const pathname = useDecodedPathname();
  const orgSlug = params?.organizationSlug as string;
  const projectSlug = params?.projectSlug as string;
  const currentUserRole = useCurrentUserRole();

  const menu = [];

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
    title: "Compliance",
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
          title: "Dependency Proxy",
          href:
            "/" +
            orgSlug +
            "/projects/" +
            projectSlug +
            "/settings/dependency-proxy",
          Icon: ThinBrickWallFireIcon,
          isActive: pathname.startsWith(
            `/${orgSlug}/projects/${projectSlug}/settings/dependency-proxy`,
          ),
          testId: "nav-group-dependency-proxy",
        },
        {
          title: "Settings",
          href: "/" + orgSlug + "/projects/" + projectSlug + "/settings",
          Icon: CogIcon,
          isActive:
            pathname.startsWith(
              `/${orgSlug}/projects/${projectSlug}/settings`,
            ) && !pathname.endsWith("/settings/dependency-proxy"),
          testId: "nav-group-settings",
        },
      ],
    );
  }

  return menu;
};
