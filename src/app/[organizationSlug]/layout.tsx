import { TooltipProvider } from "@radix-ui/react-tooltip";
import React from "react";
import { withContentTree } from "../../decorators/approuter/withContentTree";
import { withSession } from "../../decorators/approuter/withSession";

import { withOrganization } from "../../decorators/approuter/withOrganization";
import { StoreProvider } from "../../zustand/globalStoreProvider";
import { OrganizationProvider } from "../../context/OrganizationContext";
import { ClientContextWrapper } from "../../context/ClientContextWrapper";

export default async function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ organizationSlug: string }>;
}) {
  const { organizationSlug } = await params;
  const [org, contentTree] = await Promise.all([
    withOrganization(organizationSlug),
    withContentTree(organizationSlug),
  ]);

  return (
    <ClientContextWrapper
      Provider={OrganizationProvider}
      value={{
        organization: org,
        contentTree,
      }}
    >
      <TooltipProvider delayDuration={100}>{children}</TooltipProvider>
    </ClientContextWrapper>
  );
}
