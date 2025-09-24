import { TooltipProvider } from "@radix-ui/react-tooltip";
import React from "react";
import { withContentTree } from "../../decorators/approuter/withContentTree";

import { Title } from "@radix-ui/react-dialog";
import Link from "next/link";
import router from "next/navigation";
import { title } from "process";
import EntityProviderImage from "../../components/common/EntityProviderImage";
import UserNav from "../../components/navigation/UserNav";
import { OrganizationDropDown } from "../../components/OrganizationDropDown";
import { ClientContextWrapper } from "../../context/ClientContextWrapper";
import { OrganizationProvider } from "../../context/OrganizationContext";
import { withOrganization } from "../../decorators/approuter/withOrganization";
import { classNames } from "../../utils/common";
import EntityProviderBanner from "../../components/common/EntityProviderBanner";

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
