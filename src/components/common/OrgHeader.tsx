// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
"use client";

import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import DynamicHeader from "./DynamicHeader";

export default function OrgHeader() {
  const menu = useOrganizationMenu();

  return <DynamicHeader z={2} Title={null} menu={menu} />;
}
