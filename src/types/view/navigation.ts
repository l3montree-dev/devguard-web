// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type React from "react";
import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";

export interface MenuItem {
  title: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  testId?: string;
  children?: Array<MenuItem>;
}

// The asset menu builds its entries from heroicons, whose icon components carry
// a narrower prop type than MenuItem's.
export type AssetMenuItem = {
  title: string;
  href: string;
  Icon: ForwardRefExoticComponent<
    Omit<SVGProps<SVGSVGElement>, "ref"> & {
      title?: string;
      titleId?: string;
    } & RefAttributes<SVGSVGElement>
  >;
  isActive: boolean;
  testId?: string;
  children?: Array<AssetMenuItem>;
};

export type Requirement = "loggedIn" | "member" | "admin";

export type ViewMode = "risk" | "cvss";
