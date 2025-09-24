import { TooltipProvider } from "@radix-ui/react-tooltip";
import React from "react";

import { ClientContextWrapper } from "../../context/ClientContextWrapper";
import { OrganizationProvider } from "../../context/OrganizationContext";

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
        organization: {
          id: "",
          name: "User Settings",
          slug: "/",
        },
        contentTree: [],
      }}
    >
      <TooltipProvider delayDuration={100}>{children}</TooltipProvider>
    </ClientContextWrapper>
  );
}
