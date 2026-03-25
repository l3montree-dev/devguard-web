"use client";

import { FunctionComponent } from "react";
import Page from "@/components/Page";
import { useViewMode } from "@/hooks/useViewMode";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrgOverview, ReleaseRiskHistory } from "@/types/api/api";
import { fetcher, FetcherError } from "@/data-fetcher/fetcher";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AverageStatsSection from "@/components/organization/AverageStatsSection";
import OrganizationCompositionSection from "@/components/organization/OrganizationCompositionSection";
import TotalVulnerabilitiesSection from "@/components/organization/TotalVulnerabilitiesSection";

const STATS_PARAMS = new URLSearchParams({
  orgComponentsLimit: "5",
  topCVEsLimit: "5",
  topComponentsLimit: "5",
  topEcosystemsLimit: "5",
}).toString();

const OrganizationOverview: FunctionComponent = () => {
  const activeOrg = useActiveOrg();
  const orgSlug = activeOrg.slug;

  const orgMenu = useOrganizationMenu();
  const [mode, setMode] = useViewMode("devguard-org-view-mode");

  const {
    data: orgStatistics,
    isLoading: isStatisticsLoading,
    error,
  } = useSWR<OrgOverview>(
    `/organizations/${orgSlug}/stats/vuln-statistics/?${STATS_PARAMS}`,
    fetcher,
  );

  const is404 = error instanceof FetcherError && error.status === 404;
  const isError = !isStatisticsLoading && error && !is404;
  const hasNoData = !isStatisticsLoading && (is404 || !orgStatistics);

  return (
    <Page
      Menu={orgMenu}
      title="Overview"
      description="Displays an overview about the stats of the org"
    >
      <div className="mb-6 flex flex-row items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organization Overview</h1>
          <p className="text-sm text-muted-foreground">
            Insights into the vulnerability distribution and remediation efforts
            in your organization.
          </p>
        </div>
        {!hasNoData && !isError && (
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as "risk" | "cvss")}
          >
            <TabsList>
              <TabsTrigger value="risk">Risk</TabsTrigger>
              <TabsTrigger value="cvss">CVSS</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>
      {isError ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
              Failed to load vulnerability statistics. Please try again later.
            </p>
          </CardContent>
        </Card>
      ) : hasNoData ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h2 className="text-xl font-semibold">No vulnerability data yet</h2>
            <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
              This organization does not have any vulnerability data. Add
              projects to your organization to start tracking vulnerabilities.
            </p>
            <Link href={`/${orgSlug}`}>
              <Button className="mt-6" variant="secondary">
                Go to Projects
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <OrganizationCompositionSection
            mode={mode}
            isStatisticsLoading={isStatisticsLoading}
            orgStatistics={orgStatistics}
          />
          <TotalVulnerabilitiesSection
            mode={mode}
            isStatisticsLoading={isStatisticsLoading}
            orgStatistics={orgStatistics}
            riskHistory={orgStatistics?.orgRiskHistory || []}
          />
          <AverageStatsSection
            mode={mode}
            isStatisticsLoading={isStatisticsLoading}
            orgStatistics={orgStatistics}
          />
        </>
      )}
    </Page>
  );
};

export default OrganizationOverview;
