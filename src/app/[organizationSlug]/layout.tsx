import { TooltipProvider } from "@radix-ui/react-tooltip";
import React from "react";
import { withContentTree } from "../../data-fetcher/fetchContentTree";

import { ClientContextWrapper } from "../../context/ClientContextWrapper";
import { OrganizationProvider } from "../../context/OrganizationContext";
import { withOrganization } from "../../data-fetcher/fetchOrganization";
import { redirect } from "next/navigation";
import { HttpError } from "../../data-fetcher/http-error";

export default async function OrganizationLayout({
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
      withOrganization(decodeURIComponent(organizationSlug)),
      withContentTree(decodeURIComponent(organizationSlug)),
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
