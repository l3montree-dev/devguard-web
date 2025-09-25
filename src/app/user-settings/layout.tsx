import { TooltipProvider } from "@radix-ui/react-tooltip";
import React from "react";

import { ClientContextWrapper } from "../../context/ClientContextWrapper";
import { OrganizationProvider } from "../../context/OrganizationContext";
import { OrganizationDetailsDTO } from "../../types/api/api";

export default async function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ organizationSlug: string }>;
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
