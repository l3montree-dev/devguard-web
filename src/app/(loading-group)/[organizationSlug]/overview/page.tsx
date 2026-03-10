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
import MostUsedEcosystems from "@/components/organization/MostUsedEcosystems";
import StructureCard from "@/components/organization/StructureCard";
import VulnerabilityTrends from "@/components/organization/VulnerabilityTrends";
import { RiskHistoryDistributionDiagram } from "@/components/RiskHistoryDistributionDiagram";
import DetectionsRemediationsChart from "@/components/organization/DetectionsRemediationsChart";
import AverageFixingTimeChart from "@/components/AverageFixingTimeChart";
import DependencyAge from "@/components/organization/DependencyAge";
import AverageOpenCodeRisks from "@/components/organization/AverageOpenCodeRisks";
import RemediationTypeDistribution from "@/components/organization/RemediationDistributionChart";

const OrganizationOverview: FunctionComponent = () => {
  const activeOrg = useActiveOrg();
  const orgSlug = activeOrg.slug;
  const url = "/organizations/" + orgSlug;

  const orgMenu = useOrganizationMenu();
  const [mode, setMode] = useViewMode("devguard-org-view-mode");

  const params = new URLSearchParams({
    orgComponentsLimit: "5",
    topCVEsLimit: "5",
    topComponentsLimit: "5",
    topEcosystemsLimit: "5",
  });

  const { data: orgStatistics, isLoading: isStatisticsLoading } =
    useSWR<OrgOverview>(`${url}/stats/vuln-statistics/?${params}`, fetcher);

  const totalRemediations = Math.round(
    (orgStatistics?.vulnEventAverage?.averageAcceptedEvents ?? 0) +
      (orgStatistics?.vulnEventAverage?.averageFalsePositiveEvents ?? 0) +
      (orgStatistics?.vulnEventAverage?.averageFixedEvents ?? 0),
  );

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
  return (
    <>
      <Page
        Menu={orgMenu}
        title="Overview"
        description="Displays an overview about the stats of the org"
        Title={null}
      >
        <div className="fixed left-89/100 top-89/100">
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as "risk" | "cvss")}
          >
            <TabsList className="py-8 px-4 border-primary border-2">
              <TabsTrigger className="text-base py-4 px-4" value="risk">
                Risk
              </TabsTrigger>
              <TabsTrigger className="text-base py-4 px-4" value="cvss">
                CVSS
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Section
          primaryHeadline
          forceVertical
          description=""
          title="Vulnerability Overview in Organization"
          className="mt-12"
        >
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as "risk" | "cvss")}
          >
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
          <RiskHistoryDistributionDiagram
            isLoading={isStatisticsLoading}
            data={convertedRiskHistory}
            mode={mode}
          />
        </Section>
        <Section
          primaryHeadline
          forceVertical
          description=""
          title="Vulnerability Averages in Organization"
          className="mt-12"
        >
          <div className="grid grid-cols-4 gap-4">
            <SeverityCard
              variant="critical"
              isLoading={isStatisticsLoading}
              currentAmount={Math.round(
                (mode === "risk"
                  ? orgStatistics?.projectOpenVulnAverage.riskCriticalAverage
                  : orgStatistics?.projectOpenVulnAverage
                      .cvssCriticalAverage) ?? 0,
              )}
              mode={mode}
            />
            <SeverityCard
              variant="high"
              isLoading={isStatisticsLoading}
              currentAmount={Math.round(
                (mode === "risk"
                  ? orgStatistics?.projectOpenVulnAverage.riskHighAverage
                  : orgStatistics?.projectOpenVulnAverage.cvssHighAverage) ?? 0,
              )}
              mode={mode}
            />
            <SeverityCard
              variant="medium"
              isLoading={isStatisticsLoading}
              currentAmount={Math.round(
                (mode === "risk"
                  ? orgStatistics?.projectOpenVulnAverage.riskMediumAverage
                  : orgStatistics?.projectOpenVulnAverage.cvssMediumAverage) ??
                  0,
              )}
              mode={mode}
            />
            <SeverityCard
              variant="low"
              isLoading={isStatisticsLoading}
              currentAmount={Math.round(
                (mode === "risk"
                  ? orgStatistics?.projectOpenVulnAverage.riskLowAverage
                  : orgStatistics?.projectOpenVulnAverage.cvssLowAverage) ?? 0,
              )}
              mode={mode}
            />
          </div>
          <RemediationTypeDistribution
            distribution={orgStatistics?.remediationTypeDistribution}
          />
          <VulnerabilityTrends
            averagesByTypes={orgStatistics?.vulnEventAverage}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <DetectionsRemediationsChart
                weeklyDetections={Math.round(
                  orgStatistics?.vulnEventAverage.averageDetectedEvents ?? 0,
                )}
                weeklyRemediations={totalRemediations}
              />
              <AverageOpenCodeRisks
                amount={orgStatistics?.averageOpenCodeRisksPerProject}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-4 grid grid-cols-4 gap-4">
              <AverageFixingTimeChart
                mode={mode}
                variant="critical"
                title="Avg. remediation time"
                description="Time for critical severity vulnerabilities"
                avgFixingTime={{
                  averageFixingTimeSeconds:
                    orgStatistics?.averageRemediationTimes
                      ?.criticalRiskAverage ?? 0,
                  averageFixingTimeSecondsByCvss:
                    orgStatistics?.averageRemediationTimes
                      ?.criticalCVSSAverage ?? 0,
                }}
                isLoading={isStatisticsLoading}
              />

              <AverageFixingTimeChart
                mode={mode}
                variant="high"
                title="Avg. remediation time"
                description="Time for high severity vulnerabilities"
                avgFixingTime={{
                  averageFixingTimeSeconds:
                    orgStatistics?.averageRemediationTimes?.highRiskAverage ??
                    0,
                  averageFixingTimeSecondsByCvss:
                    orgStatistics?.averageRemediationTimes?.highCVSSAverage ??
                    0,
                }}
                isLoading={isStatisticsLoading}
              />

              <AverageFixingTimeChart
                mode={mode}
                variant="medium"
                title="Avg. remediation time"
                description="Time for medium severity vulnerabilities"
                avgFixingTime={{
                  averageFixingTimeSeconds:
                    orgStatistics?.averageRemediationTimes?.mediumRiskAverage ??
                    0,
                  averageFixingTimeSecondsByCvss:
                    orgStatistics?.averageRemediationTimes?.mediumCVSSAverage ??
                    0,
                }}
                isLoading={isStatisticsLoading}
              />

              <AverageFixingTimeChart
                mode={mode}
                variant="low"
                title="Avg. remediation time"
                description="Time for low severity vulnerabilities"
                avgFixingTime={{
                  averageFixingTimeSeconds:
                    orgStatistics?.averageRemediationTimes?.lowRiskAverage ?? 0,
                  averageFixingTimeSecondsByCvss:
                    orgStatistics?.averageRemediationTimes?.lowCVSSAverage ?? 0,
                }}
                isLoading={isStatisticsLoading}
              />
            </div>
          </div>
        </Section>

        <Section
          primaryHeadline
          forceVertical
          description=""
          title="Organization Composition"
          className="mt-20"
        >
          <div className="grid grid-cols-3 gap-4 mt-4">
            <StructureCard
              type="Projects"
              mode={mode}
              currentAmount={orgStatistics?.structure.numProjects ?? 0}
              topEntries={orgStatistics?.topProjects ?? []}
              isLoading={isStatisticsLoading}
            />
            <StructureCard
              type="Assets"
              mode={mode}
              currentAmount={orgStatistics?.structure.numAssets ?? 0}
              topEntries={orgStatistics?.topAssets ?? []}
              isLoading={isStatisticsLoading}
            />
            <StructureCard
              type="Artifacts"
              mode={mode}
              currentAmount={orgStatistics?.structure.numArtifacts ?? 0}
              topEntries={orgStatistics?.topArtifacts ?? []}
              isLoading={isStatisticsLoading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <MostUsedEcosystems
              ecosystems={orgStatistics?.topEcosystems ?? []}
            />
            <DependencyAge
              averageAge={orgStatistics?.averageAgeOfDependencies}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <MostUsedComponents
              topComponents={orgStatistics?.topComponents ?? []}
            />
            <MostCommonCVEs topCVEs={orgStatistics?.topCVEs ?? []} />
          </div>
        </Section>
      </Page>
    </>
  );
};

export default OrganizationOverview;
