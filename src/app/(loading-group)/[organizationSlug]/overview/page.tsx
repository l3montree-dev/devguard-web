"use client";

import { FunctionComponent } from "react";
import Page from "../../../../components/Page";
import { useViewMode } from "src/hooks/useViewMode";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "src/components/ui/tabs";

import { OrgOverview, ReleaseRiskHistory } from "src/types/api/api";
import { fetcher } from "src/data-fetcher/fetcher";
import { useActiveOrg } from "src/hooks/useActiveOrg";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import Section from "src/components/common/Section";
import SeverityCard from "src/components/SeverityCard";
import useSWR from "swr";
import MostUsedComponents from "@/components/organization/MostUsedComponents";
import MostCommonCVEs from "@/components/organization/MostCommonCVEs";
import VulnerabilityTrends from "@/components/organization/VulnerabilityTrends";
import { RiskHistoryDistributionDiagram } from "@/components/RiskHistoryDistributionDiagram";

const OrganizationOverview: FunctionComponent = () => {
  const activeOrg = useActiveOrg();
  const orgSlug = activeOrg.slug;
  const url = "/organizations/" + orgSlug;

  const orgMenu = useOrganizationMenu();
  const [mode, setMode] = useViewMode("devguard-org-view-mode");

  const { data: orgStatistics, isLoading: isStatisticsLoading } =
    useSWR<OrgOverview>(url + "/stats/vuln-statistics/", fetcher);

  const averageRemediations =
    Math.round(
      100 *
        ((orgStatistics?.vulnEventAverage?.averageAcceptedEvents ?? 0) +
          (orgStatistics?.vulnEventAverage?.averageFalsePositiveEvents ?? 0) +
          (orgStatistics?.vulnEventAverage?.averageFixedEvents ?? 0)),
    ) / 100;

  const convertedRiskHistory: ReleaseRiskHistory[] =
    orgStatistics?.orgRiskHistory.map(
      (entry) =>
        ({
          day: entry.day,
          cvePurlLow: entry.lowRisk,
          cvePurlMedium: entry.mediumRisk,
          cvePurlHigh: entry.highRisk,
          cvePurlCritical: entry.criticalRisk,
          cvePurlLowCvss: entry.lowCVSS,
          cvePurlMediumCvss: entry.mediumCVSS,
          cvePurlHighCvss: entry.highCVSS,
          cvePurlCriticalCvss: entry.criticalCVSS,
        }) as ReleaseRiskHistory,
    ) ?? [];

  console.log("convertedRiskHistory", convertedRiskHistory);

  return (
    <Page
      Menu={orgMenu}
      title="Overview"
      description="Displays an overview about the stats of the org"
      Title={null}
    >
      <Section
        primaryHeadline
        forceVertical
        description=""
        title="Total Vulnerabilities"
        className="mt-12"
      >
        <Tabs
          value={mode}
          onValueChange={(value) => setMode(value as "risk" | "cvss")}
        >
          <div className="flex mb-4">
            <TabsList>
              <TabsTrigger value="risk">Risk values</TabsTrigger>
              <TabsTrigger value="cvss">CVSS values</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value={mode} className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <SeverityCard
                variant="critical"
                isLoading={isStatisticsLoading}
                currentAmount={
                  (mode === "risk"
                    ? orgStatistics?.vulnDistribution.criticalRisk
                    : orgStatistics?.vulnDistribution.criticalCVSS) ?? 0
                }
                mode={mode}
              />
              <SeverityCard
                variant="high"
                isLoading={isStatisticsLoading}
                currentAmount={
                  (mode === "risk"
                    ? orgStatistics?.vulnDistribution.highRisk
                    : orgStatistics?.vulnDistribution.highCVSS) ?? 0
                }
                mode={mode}
              />
              <SeverityCard
                variant="medium"
                isLoading={isStatisticsLoading}
                currentAmount={
                  (mode === "risk"
                    ? orgStatistics?.vulnDistribution.mediumRisk
                    : orgStatistics?.vulnDistribution.mediumCVSS) ?? 0
                }
                mode={mode}
              />
              <SeverityCard
                variant="low"
                isLoading={isStatisticsLoading}
                currentAmount={
                  (mode === "risk"
                    ? orgStatistics?.vulnDistribution.lowRisk
                    : orgStatistics?.vulnDistribution.lowCVSS) ?? 0
                }
                mode={mode}
              />
            </div>
          </TabsContent>
        </Tabs>
      </Section>
      <Section
        primaryHeadline
        forceVertical
        description=""
        title="Dependency Overview"
        className="mt-12"
      >
        <div className="mt-2 flex flex-row gap-12">
          <MostUsedComponents
            topComponents={orgStatistics?.topComponents ?? []}
          />
          <MostCommonCVEs topCVEs={orgStatistics?.topCVEs ?? []} />
        </div>
      </Section>
      <Section
        primaryHeadline
        forceVertical
        description=""
        title="Vulnerability Trends"
        className="mt-12"
      >
        <RiskHistoryDistributionDiagram
          isLoading={isStatisticsLoading}
          data={convertedRiskHistory}
          mode={mode}
        />
        <VulnerabilityTrends
          averagesByTypes={orgStatistics?.vulnEventAverage}
        />
      </Section>
    </Page>
  );
};

export default OrganizationOverview;
