// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import Section from "@/components/common/Section";
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

interface SeverityRemediation {
  variant: Severity;
  remediationRisk: number | undefined;
  remediationCvss: number | undefined;
  openRisk: number | undefined;
  openCvss: number | undefined;
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

  const remediation = orgStatistics?.averageRemediationTimes;

  const severities: SeverityRemediation[] = [
    {
      variant: "critical",
      remediationRisk: remediation?.criticalRiskRemediated,
      remediationCvss: remediation?.criticalCVSSRemediated,
      openRisk: remediation?.criticalRiskOpen,
      openCvss: remediation?.criticalCVSSOpen,
    },
    {
      variant: "high",
      remediationRisk: remediation?.highRiskRemediated,
      remediationCvss: remediation?.highCVSSRemediated,
      openRisk: remediation?.highRiskOpen,
      openCvss: remediation?.highCVSSOpen,
    },
    {
      variant: "medium",
      remediationRisk: remediation?.mediumRiskRemediated,
      remediationCvss: remediation?.mediumCVSSRemediated,
      openRisk: remediation?.mediumRiskOpen,
      openCvss: remediation?.mediumCVSSOpen,
    },
    {
      variant: "low",
      remediationRisk: remediation?.lowRiskRemediated,
      remediationCvss: remediation?.lowCVSSRemediated,
      openRisk: remediation?.lowRiskOpen,
      openCvss: remediation?.lowCVSSOpen,
    },
  ];

  return (
    <Section
      forceVertical
      title="Remediation & Open Vulnerability Metrics"
      description="Mean time to remediate vulnerabilities and the average age of currently open vulnerabilities, broken down by severity."
      className="mt-16"
    >
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
      <div data-tour="average-stats-section" className="grid grid-cols-4 gap-4">
        {severities.map(
          ({
            variant,
            remediationRisk,
            remediationCvss,
            openRisk,
            openCvss,
          }) => (
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
              openAge={{
                averageFixingTimeSeconds: openRisk ?? 0,
                averageFixingTimeSecondsByCvss: openCvss ?? 0,
              }}
              isLoading={isStatisticsLoading}
            />
          ),
        )}
      </div>
    </Section>
  );
}
