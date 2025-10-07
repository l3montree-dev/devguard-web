// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import OrgHeader from "@/components/common/OrgHeader";
import RootHeader from "@/components/common/RootHeader";
import UserNav from "@/components/navigation/UserNav";
import { OrganizationDropDown } from "@/components/OrganizationDropDown";
import { classNames } from "@/utils/common";
import React from "react";

export default function Layout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RootHeader />
      <div className="pt-[112px]">{children}</div>
    </>
  );
}
