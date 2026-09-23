// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { TooltipProvider } from "@radix-ui/react-tooltip";
import React, { Suspense } from "react";
import OrgHeader from "@/components/common/OrgHeader";
import { ClientContextWrapper } from "../../../context/ClientContextWrapper";
import { OrganizationProvider } from "../../../context/OrganizationContext";
import { fetchOrganization } from "../../../data-fetcher/fetchOrganization";
import { handleHttpError } from "../../../data-fetcher/handleHttpError";

export default function OrganizationLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ organizationSlug: string }>;
}) {
  return (
    <TooltipProvider delayDuration={100}>
      <Suspense>
        <OrganizationShell params={params}>{children}</OrganizationShell>
      </Suspense>
    </TooltipProvider>
  );
}

async function OrganizationShell({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ organizationSlug: string }>;
}) {
  let organizationSlug = "";
  let org;
  try {
    const { organizationSlug: slug } = await params;
    organizationSlug = slug;
    [org] = await Promise.all([
      fetchOrganization(decodeURIComponent(organizationSlug)),
    ]);
  } catch (error) {
    handleHttpError(error, organizationSlug);
  }

  return (
    <ClientContextWrapper
      Provider={OrganizationProvider}
      value={{
        organization: org,
      }}
    >
      <OrgHeader />
      {children}
    </ClientContextWrapper>
  );
}
