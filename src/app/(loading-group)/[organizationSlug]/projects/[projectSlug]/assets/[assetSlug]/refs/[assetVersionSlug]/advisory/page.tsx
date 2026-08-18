"use client";

import AdvisoryDialog from "@/components/AdvisoryDialog";
import AdvisoryTable from "@/components/advisory/AdvisoryTable";
import AuthGuard from "@/components/AuthGuard";
import AssetTitle from "@/components/common/AssetTitle";
import Section from "@/components/common/Section";
import Page from "@/components/Page";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConfig } from "@/context/ConfigContext";
import { useAdvisoryList } from "@/hooks/useAdvisory";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useDecodedParams from "@/hooks/useDecodedParams";
import useRouterQuery from "@/hooks/useRouterQuery";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { FunctionComponent } from "react";
import { useState } from "react";

const TABS = [
  { value: "draft", label: "Draft" },
  { value: "public", label: "Public" },
  { value: "withdrawn", label: "Withdrawn" },
] as const;

const Index: FunctionComponent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const config = useConfig();
  const assetMenu = useAssetMenu();
  const push = useRouterQuery();
  const { organizationSlug, projectSlug, assetSlug } = useDecodedParams();

  const { advisories, isLoading, state, createAdvisory } = useAdvisoryList();

  const csafBaseUrl = `${config.devguardApiUrlPublicInternet}/api/v1/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}`;

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Page Menu={assetMenu} title={"Security Advisory"} Title={<AssetTitle />}>
      {dialogOpen && (
        <AdvisoryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={createAdvisory}
        />
      )}
      <div className="flex flex-row items-center justify-end">
        <div className="flex flex-row gap-2">
          <AuthGuard require="admin">
            <Button
              onClick={() => setDialogOpen(true)}
              variant="default"
              data-testid="create-security-advisory"
            >
              Create Security Advisory
            </Button>
          </AuthGuard>
        </div>
      </div>
      <Section
        forceVertical
        primaryHeadline
        title="Security Advisories"
        description="This table shows all the created security advisories of this repository."
        className="mb-4 mt-4"
      >
        <div className="flex flex-1 flex-col gap-2">
          <Tabs value={state}>
            <TabsList>
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  onClick={() => push({ state: tab.value, page: 1 })}
                  value={tab.value}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 ">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </Section>
      <AdvisoryTable
        advisories={advisories}
        state={state}
        csafBaseUrl={csafBaseUrl}
        onRowClick={(advisory) => router?.push(pathname + "/" + advisory.id)}
      />
    </Page>
  );
};

export default Index;
