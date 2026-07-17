// Copyright (C) 2026 l3montree GmbH
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

"use client";

import { classNames } from "@/utils/common";
import Image from "next/image";
import type { FunctionComponent } from "react";

// Maps a component's exact title to a public/assets svg. Falls back to the
// DevGuard mark for any title not listed here.
const TITLE_ICONS: Record<string, string> = {
  DevGuard: "/logo_icon.svg",
  openCode: "/logos/opencode.svg",
  "container.gov.de": "/logos/container-gov-de.svg",
  "Badge-Programm": "/logos/badge.svg",
};

const DEFAULT_ICON = "/logo_icon.svg";

function iconForTitle(title: string): string {
  return TITLE_ICONS[title] ?? DEFAULT_ICON;
}

const SIZES = {
  sm: 14,
  md: 20,
  lg: 24,
} as const;

interface Props {
  title: string;
  size?: keyof typeof SIZES;
  className?: string;
}

const ComplianceComponentIcon: FunctionComponent<Props> = ({
  title,
  size = "md",
  className,
}) => {
  const px = SIZES[size];
  return (
    <Image
      src={iconForTitle(title)}
      alt={title}
      width={px}
      height={px}
      className={classNames("shrink-0", className)}
    />
  );
};

export default ComplianceComponentIcon;
