// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { TooltipProvider } from "@radix-ui/react-tooltip";
import React from "react";

import { ClientContextWrapper } from "../../../context/ClientContextWrapper";
import { OrganizationProvider } from "../../../context/OrganizationContext";
import type { OrganizationDetailsDTO } from "@/types/dto";

export default async function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientContextWrapper
      Provider={OrganizationProvider}
      value={{
        // this makes no sense right here.
        // would be better to move the user settings into another layout which doesnt expect an organization to be set.
        organization: {
          id: "",
          name: "User Settings",
          slug: "/",
        } as OrganizationDetailsDTO,
        contentTree: [],
      }}
    >
      <TooltipProvider delayDuration={100}>{children}</TooltipProvider>
    </ClientContextWrapper>
  );
}
