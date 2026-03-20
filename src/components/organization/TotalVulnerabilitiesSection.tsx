// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import Section from "@/components/common/Section";
import { RiskHistoryDistributionDiagram } from "@/components/RiskHistoryDistributionDiagram";
import SeverityCard from "@/components/SeverityCard";
import { OrgOverview, ReleaseRiskHistory } from "@/types/api/api";
import MostUsedComponents from "./MostUsedComponents";
import MostCommonCVEs from "./MostCommonCVEs";

export interface TotalVulnerabilitiesSectionProps {
  mode: "risk" | "cvss";
  isStatisticsLoading: boolean;
  orgStatistics: OrgOverview | undefined;
  convertedRiskHistory: ReleaseRiskHistory[];
}

export default function TotalVulnerabilitiesSection({
  mode,
  isStatisticsLoading,
  orgStatistics,
  convertedRiskHistory,
}: TotalVulnerabilitiesSectionProps) {
  return (
    <Section
      forceVertical
      title="Total Vulnerability Distribution"
      description="Distribution of open vulnerabilities across the organization, along with the most common vulnerabilities and components."
      className="mt-16"
    >
      <div className="grid grid-cols-4 gap-4">
        <SeverityCard
          variant="critical"
          isLoading={isStatisticsLoading}
          currentAmount={
            (mode === "risk"
              ? orgStatistics?.vulnDistribution.critical
              : orgStatistics?.vulnDistribution.criticalCvss) ?? 0
          }
          mode={mode}
        />
        <SeverityCard
          variant="high"
          isLoading={isStatisticsLoading}
          currentAmount={
            (mode === "risk"
              ? orgStatistics?.vulnDistribution.high
              : orgStatistics?.vulnDistribution.highCvss) ?? 0
          }
          mode={mode}
        />
        <SeverityCard
          variant="medium"
          isLoading={isStatisticsLoading}
          currentAmount={
            (mode === "risk"
              ? orgStatistics?.vulnDistribution.medium
              : orgStatistics?.vulnDistribution.mediumCvss) ?? 0
          }
          mode={mode}
        />
        <SeverityCard
          variant="low"
          isLoading={isStatisticsLoading}
          currentAmount={
            (mode === "risk"
              ? orgStatistics?.vulnDistribution.low
              : orgStatistics?.vulnDistribution.lowCvss) ?? 0
          }
          mode={mode}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <MostUsedComponents
          topComponents={orgStatistics?.topComponents ?? []}
        />
        <MostCommonCVEs topCVEs={orgStatistics?.topCVEs ?? []} />
      </div>
      <div>
        <RiskHistoryDistributionDiagram
          data={convertedRiskHistory}
          isLoading={isStatisticsLoading}
          mode={mode}
        />
      </div>
    </Section>
  );
}
