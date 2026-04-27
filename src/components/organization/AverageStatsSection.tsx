// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import Section from "@/components/common/Section";
import SeverityCard from "@/components/SeverityCard";
import RemediationTypeDistribution from "@/components/organization/RemediationDistributionChart";
import VulnerabilityTrends from "@/components/organization/VulnerabilityTrends";
import DetectionsRemediationsChart from "@/components/organization/DetectionsRemediationsChart";
import AverageOpenCodeRisks from "@/components/organization/AverageOpenCodeRisks";
import AverageFixingTimeChart from "@/components/AverageFixingTimeChart";
import type { OrgOverview } from "@/types/api/api";

export interface AverageStatsSectionProps {
  mode: "risk" | "cvss";
  isStatisticsLoading: boolean;
  orgStatistics: OrgOverview | undefined;
}

type Severity = "critical" | "high" | "medium" | "low";

interface SeverityAvg {
  variant: Severity;
  risk: number | undefined;
  cvss: number | undefined;
  remediationRisk: number | undefined;
  remediationCvss: number | undefined;
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

  const severities: SeverityAvg[] = [
    {
      variant: "critical",
      risk: orgStatistics?.projectOpenVulnAverage.riskCriticalAverage,
      cvss: orgStatistics?.projectOpenVulnAverage.cvssCriticalAverage,
      remediationRisk:
        orgStatistics?.averageRemediationTimes?.criticalRiskAverage,
      remediationCvss:
        orgStatistics?.averageRemediationTimes?.criticalCVSSAverage,
    },
    {
      variant: "high",
      risk: orgStatistics?.projectOpenVulnAverage.riskHighAverage,
      cvss: orgStatistics?.projectOpenVulnAverage.cvssHighAverage,
      remediationRisk: orgStatistics?.averageRemediationTimes?.highRiskAverage,
      remediationCvss: orgStatistics?.averageRemediationTimes?.highCVSSAverage,
    },
    {
      variant: "medium",
      risk: orgStatistics?.projectOpenVulnAverage.riskMediumAverage,
      cvss: orgStatistics?.projectOpenVulnAverage.cvssMediumAverage,
      remediationRisk:
        orgStatistics?.averageRemediationTimes?.mediumRiskAverage,
      remediationCvss:
        orgStatistics?.averageRemediationTimes?.mediumCVSSAverage,
    },
    {
      variant: "low",
      risk: orgStatistics?.projectOpenVulnAverage.riskLowAverage,
      cvss: orgStatistics?.projectOpenVulnAverage.cvssLowAverage,
      remediationRisk: orgStatistics?.averageRemediationTimes?.lowRiskAverage,
      remediationCvss: orgStatistics?.averageRemediationTimes?.lowCVSSAverage,
    },
  ];

  return (
    <Section
      forceVertical
      title="Average Open Vulnerabilities per Project"
      description="Mean number of unresolved vulnerabilities across projects, broken down by severity."
      className="mt-16"
    >
      <div className="grid grid-cols-4 gap-4">
        {severities.map(({ variant, risk, cvss }) => (
          <SeverityCard
            key={variant}
            variant={variant}
            isLoading={isStatisticsLoading}
            currentAmount={Math.round((mode === "risk" ? risk : cvss) ?? 0)}
            mode={mode}
          />
        ))}
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
        {severities.map(({ variant, remediationRisk, remediationCvss }) => (
          <AverageFixingTimeChart
            key={variant}
            mode={mode}
            variant={variant}
            title="Avg. remediation time"
            description={`Time for ${variant} severity vulnerabilities`}
            avgFixingTime={{
              averageFixingTimeSeconds: remediationRisk ?? 0,
              averageFixingTimeSecondsByCvss: remediationCvss ?? 0,
            }}
            isLoading={isStatisticsLoading}
          />
        ))}
      </div>
    </Section>
  );
}
