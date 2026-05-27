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
    }
  }
  redirect("/");
}
