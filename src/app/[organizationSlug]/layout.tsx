import { TooltipProvider } from "@radix-ui/react-tooltip";
import React, { Suspense } from "react";
import { withContentTree } from "../../decorators/approuter/withContentTree";
import { withSession } from "../../decorators/approuter/withSession";

import { withOrganization } from "../../decorators/approuter/withOrganization";
import { StoreProvider } from "../../zustand/globalStoreProvider";
import { OrganizationProvider } from "../../context/OrganizationContext";
import { ClientContextWrapper } from "../../context/ClientContextWrapper";
import Loading from "../../components/common/Loading";

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
    withOrganization(organizationSlug.replace("%40", "@")),
    withContentTree(organizationSlug.replace("%40", "@")),
  ]);

  return (
    <Suspense fallback={<Loading />}>
      <ClientContextWrapper
        Provider={OrganizationProvider}
        value={{
          organization: org,
          contentTree,
        }}
      >
        <TooltipProvider delayDuration={100}>{children}</TooltipProvider>
      </ClientContextWrapper>
    </Suspense>
  );
}
