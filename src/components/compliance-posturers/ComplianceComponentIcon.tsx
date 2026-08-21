// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

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
