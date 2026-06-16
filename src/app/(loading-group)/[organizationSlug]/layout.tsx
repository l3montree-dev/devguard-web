import { TooltipProvider } from "@radix-ui/react-tooltip";
import React, { Suspense } from "react";
import { fetchContentTree } from "../../../data-fetcher/fetchContentTree";

import OrgHeader from "@/components/common/OrgHeader";
import { redirect } from "next/navigation";
import { config } from "../../../config";
import { ClientContextWrapper } from "../../../context/ClientContextWrapper";
import { OrganizationProvider } from "../../../context/OrganizationContext";
import { fetchOrganization } from "../../../data-fetcher/fetchOrganization";
import { HttpError } from "../../../data-fetcher/http-error";

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
  try {
    const { organizationSlug: slug } = await params;
    organizationSlug = slug;
    const [org, contentTree] = await Promise.all([
      fetchOrganization(decodeURIComponent(organizationSlug)),
      fetchContentTree(decodeURIComponent(organizationSlug)),
    ]);

    return (
      <ClientContextWrapper
        Provider={OrganizationProvider}
        value={{
          organization: org,
          contentTree,
        }}
      >
        <OrgHeader />
        {children}
      </ClientContextWrapper>
    );
  } catch (error) {
    if (error instanceof HttpError && error.statusCode === 402) {
      const billingUrl = new URL(config.billingUrl);
      billingUrl.searchParams.set("expired", "1");
      if (organizationSlug) {
        billingUrl.searchParams.set("orgName", organizationSlug);
      }
      redirect(billingUrl.toString());
    } else if (error instanceof HttpError && error.statusCode === 403) {
      // this only happens, if the user needs to reauthorize an identity provider. In this case we can show a specific error message.
      redirect("/" + organizationSlug + "/oauth2error");
    } else if (
      error instanceof HttpError &&
      (error.statusCode === 401 || error.statusCode === 404)
    ) {
      // Let the error boundary handle 401/404 to show proper error pages
      throw error;
    } else {
      console.error("An unexpected error occurred:", error);
      throw error;
    }
  }
}
