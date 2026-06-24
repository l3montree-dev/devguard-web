"use client";

import { orgOverviewTourSteps } from "@/components/common/tours/org-overview-tour";
import AverageStatsSection from "@/components/organization/AverageStatsSection";
import OrganizationCompositionSection from "@/components/organization/OrganizationCompositionSection";
import TotalVulnerabilitiesSection from "@/components/organization/TotalVulnerabilitiesSection";
import Page from "@/components/Page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetcher, FetcherError } from "@/data-fetcher/fetcher";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import { useAutoTour } from "@/hooks/useAutoTour";
import { useViewMode } from "@/hooks/useViewMode";
import type { OrgOverview } from "@/types/api/api";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState, type FunctionComponent } from "react";
import useSWR from "swr";

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
  useAutoTour("org-overview", orgOverviewTourSteps);

  const {
    data: orgStatistics,
    isLoading: isStatisticsLoading,
    error,
    mutate,
  } = useSWR<OrgOverview>(
    `/organizations/${orgSlug}/stats/vuln-statistics/?${STATS_PARAMS}`,
    fetcher,
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  // The backend caches these statistics for 15 minutes. Hitting the same
  // endpoint with `forceRefresh=true` bypasses that cache; we then seed the SWR
  // cache with the fresh result so a plain revalidation wouldn't undo it.
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const fresh = await fetcher<OrgOverview>(
        `/organizations/${orgSlug}/stats/vuln-statistics/?${STATS_PARAMS}&forceRefresh=true`,
      );
      await mutate(fresh, { revalidate: false });
    } catch {
      // Fetch failures surface through SWR's own error state on next load.
    } finally {
      setIsRefreshing(false);
    }
  };

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
        <div data-tour="overview-header">
          <h1 className="text-2xl font-bold">Organization Overview</h1>
          <p className="text-sm text-muted-foreground">
            Insights into the vulnerability distribution and remediation efforts
            in your organization.
          </p>
        </div>
        {!hasNoData && !isError && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || isStatisticsLoading}
            >
              <ArrowPathIcon
                className={`mr-1.5 h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Tabs
              data-tour="view-mode-tabs"
              value={mode}
              onValueChange={(value) => setMode(value as "risk" | "cvss")}
            >
              <TabsList>
                <TabsTrigger value="risk">Risk</TabsTrigger>
                <TabsTrigger value="cvss">CVSS</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
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
