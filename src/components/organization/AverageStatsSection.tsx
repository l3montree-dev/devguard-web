// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import Section from "@/components/common/Section";
import SeverityCard from "@/components/SeverityCard";
import RemediationTypeDistribution from "@/components/organization/RemediationDistributionChart";
import VulnerabilityTrends from "@/components/organization/VulnerabilityTrends";
import DetectionsRemediationsChart from "@/components/organization/DetectionsRemediationsChart";
import AverageOpenCodeRisks from "@/components/organization/AverageOpenCodeRisks";
import AverageFixingTimeChart from "@/components/AverageFixingTimeChart";
import { OrgOverview } from "@/types/api/api";

export interface AverageStatsSectionProps {
  mode: "risk" | "cvss";
  isStatisticsLoading: boolean;
  orgStatistics: OrgOverview | undefined;
}

export default function AverageStatsSection({
  mode,
  isStatisticsLoading,
  orgStatistics,
}: AverageStatsSectionProps) {
  const totalRemediations = Math.round(
    (orgStatistics?.vulnEventAverage?.averageAcceptedEvents ?? 0) +
      (orgStatistics?.vulnEventAverage?.averageFalsePositiveEvents ?? 0) +
      (orgStatistics?.vulnEventAverage?.averageFixedEvents ?? 0),
  );

  return (
    <Section
      forceVertical
      title="Average Open Vulnerabilities per Project"
      description="Mean number of unresolved vulnerabilities across projects, broken down by severity."
      className="mt-16"
    >
      <div className="grid grid-cols-4 gap-4">
        <SeverityCard
          variant="critical"
          isLoading={isStatisticsLoading}
          currentAmount={Math.round(
            (mode === "risk"
              ? orgStatistics?.projectOpenVulnAverage.riskCriticalAverage
              : orgStatistics?.projectOpenVulnAverage.cvssCriticalAverage) ?? 0,
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
              : orgStatistics?.projectOpenVulnAverage.cvssMediumAverage) ?? 0,
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
      <VulnerabilityTrends averagesByTypes={orgStatistics?.vulnEventAverage} />
      <div className="grid grid-cols-2 gap-4">
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
      <div className="grid grid-cols-4 gap-4">
        <AverageFixingTimeChart
          mode={mode}
          variant="critical"
          title="Avg. remediation time"
          description="Time for critical severity vulnerabilities"
          avgFixingTime={{
            averageFixingTimeSeconds:
              orgStatistics?.averageRemediationTimes?.criticalRiskAverage ?? 0,
            averageFixingTimeSecondsByCvss:
              orgStatistics?.averageRemediationTimes?.criticalCVSSAverage ?? 0,
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
              orgStatistics?.averageRemediationTimes?.highRiskAverage ?? 0,
            averageFixingTimeSecondsByCvss:
              orgStatistics?.averageRemediationTimes?.highCVSSAverage ?? 0,
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
              orgStatistics?.averageRemediationTimes?.mediumRiskAverage ?? 0,
            averageFixingTimeSecondsByCvss:
              orgStatistics?.averageRemediationTimes?.mediumCVSSAverage ?? 0,
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
    </Section>
  );
}
