// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { CogIcon, ListBulletIcon } from "@heroicons/react/24/outline";
import { ChartBarIcon, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { useActiveOrg } from "./useActiveOrg";
import useDecodedParams from "./useDecodedParams";
import { isAdmin, useCurrentUserRole } from "./useUserRole";

export const useOrganizationMenu = () => {
  const pathName = usePathname() || "/";
  const { organizationSlug: orgSlug } = useDecodedParams() as {
    organizationSlug: string;
  };

  const currentUserRole = useCurrentUserRole();

  // decode the path name and the org slug
  const decodedPathName = decodeURIComponent(pathName);
  const decodedOrgSlug = decodeURIComponent(orgSlug);

  const org = useActiveOrg();
  const menu = [];

  if (isAdmin(currentUserRole)) {
    menu.push({
      title: "Overview",
      href: "/" + decodedOrgSlug + "/overview",
      Icon: ChartBarIcon,
      isActive: decodedPathName === "/" + decodedOrgSlug + "/overview",
      testId: "nav-org-overview",
    });
  }

  menu.push({
    title: "Groups",
    href: "/" + decodedOrgSlug,
    Icon: ListBulletIcon,
    isActive: decodedPathName === "/" + decodedOrgSlug,
    testId: "nav-org-groups",
  });

  if (isAdmin(currentUserRole) && !org.externalEntityProviderId) {
    menu.push(
      ...[
        {
          title: "Compliance Postures",
          href: "/" + decodedOrgSlug + "/compliance-postures",
          Icon: ShieldCheck,
          isActive: decodedPathName.startsWith(
            "/" + decodedOrgSlug + "/compliance-postures",
          ),
          testId: "nav-org-compliance-postures",
        },
        {
          title: "Settings",
          href: "/" + decodedOrgSlug + "/settings",
          Icon: CogIcon,
          isActive: decodedPathName.startsWith(
            "/" + decodedOrgSlug + "/settings",
          ),
          testId: "nav-org-settings",
        },
      ],
    );
  }
  return menu;
};
