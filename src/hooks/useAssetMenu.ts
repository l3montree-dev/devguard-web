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
  DocumentMagnifyingGlassIcon,
  CursorArrowRippleIcon,
  WrenchScrewdriverIcon,
  CogIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";

// along with this program.  If not, see <https://www.gnu.org/licenses/>.
export const useAssetMenu = () => {
  const router = useRouter();
  const orgSlug = router.query.organizationSlug as string;
  const projectSlug = router.query.projectSlug as string;
  const assetSlug = router.query.assetSlug as string;
  return [
    {
      title: "Overview",
      href: "/" + orgSlug + "/" + projectSlug + "/" + assetSlug,
      Icon: ChartBarSquareIcon,
    },
    {
      title: "Risk identification",
      href:
        "/" +
        orgSlug +
        "/projects/" +
        projectSlug +
        "/assets/" +
        assetSlug +
        "/risk-identification",
      Icon: DocumentMagnifyingGlassIcon,
    },
    {
      title: "Risk assessment",
      href:
        "/" +
        orgSlug +
        "/projects/" +
        projectSlug +
        "/assets/" +
        assetSlug +
        "/risk-assessment",
      Icon: CursorArrowRippleIcon,
    },
    {
      title: "Risk handling",
      href:
        "/" +
        orgSlug +
        "/projects/" +
        projectSlug +
        "/assets/" +
        assetSlug +
        "/risk-handling",
      Icon: WrenchScrewdriverIcon,
    },
    {
      title: "Dependency graph",
      href:
        "/" +
        orgSlug +
        "/projects/" +
        projectSlug +
        "/assets/" +
        assetSlug +
        "/dependency-graph",
      Icon: ShareIcon,
    },
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
    },
  ];
};
