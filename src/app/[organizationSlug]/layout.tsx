import { TooltipProvider } from "@radix-ui/react-tooltip";
import React from "react";
import { withContentTree } from "../../decorators/approuter/withContentTree";

import { ClientContextWrapper } from "../../context/ClientContextWrapper";
import { OrganizationProvider } from "../../context/OrganizationContext";
import { withOrganization } from "../../decorators/approuter/withOrganization";
import { redirect } from "next/navigation";
import { HttpError } from "../../decorators/middleware";

export default async function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ organizationSlug: string }>;
}) {
  try {
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
  } catch (error) {
    if (
      error instanceof HttpError &&
      error.instructions &&
      "redirect" in error.instructions
    ) {
      redirect(error.instructions.redirect.destination);
    }
  }
}
