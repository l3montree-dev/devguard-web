// Copyright (C) 2023 Tim Bastin, l3montree UG (haftungsbeschränkt)
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
  ServerIcon,
  UserGroupIcon,
  SignalIcon,
  GlobeAltIcon,
  ChartBarSquareIcon,
  Cog6ToothIcon,
  RectangleGroupIcon,
} from "@heroicons/react/24/outline";

// along with this program.  If not, see <http://www.gnu.org/licenses/>.
export const organizationNavigation = [
  { name: "[activeOrganization]", href: "/", icon: RectangleGroupIcon },
  { name: "Projects", href: "/[organization]", icon: ServerIcon },
  { name: "Members", href: "/[organization]/members", icon: UserGroupIcon },
  {
    name: "Latest Activity",
    href: "/[organization]/activity",
    icon: SignalIcon,
  },
  { name: "Domains", href: "/[organization]/domains", icon: GlobeAltIcon },
  {
    name: "Reports",
    href: "/[organization]/reports",
    icon: ChartBarSquareIcon,
  },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

export const userNavigation = [
  { name: "Organizations", href: "/", icon: RectangleGroupIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];
