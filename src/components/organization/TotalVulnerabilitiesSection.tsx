// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import Section from "@/components/common/Section";
import { RiskHistoryDistributionDiagram } from "@/components/RiskHistoryDistributionDiagram";
import SeverityCard from "@/components/SeverityCard";
import type {
  OrgOverview,
  ReleaseRiskHistory,
  RiskHistory,
} from "@/types/api/api";
import MostUsedComponents from "./MostUsedComponents";
import MostCommonCVEs from "./MostCommonCVEs";

export interface TotalVulnerabilitiesSectionProps {
  mode: "risk" | "cvss";
  isStatisticsLoading: boolean;
  orgStatistics: OrgOverview | undefined;
  riskHistory: ReleaseRiskHistory[];
}

export default function TotalVulnerabilitiesSection({
  mode,
  isStatisticsLoading,
  orgStatistics,
  riskHistory,
}: TotalVulnerabilitiesSectionProps) {
  const severities = [
    {
      variant: "critical" as const,
      risk: orgStatistics?.vulnDistribution.critical,
      cvss: orgStatistics?.vulnDistribution.criticalCvss,
    },
    {
      variant: "high" as const,
      risk: orgStatistics?.vulnDistribution.high,
      cvss: orgStatistics?.vulnDistribution.highCvss,
    },
    {
      variant: "medium" as const,
      risk: orgStatistics?.vulnDistribution.medium,
      cvss: orgStatistics?.vulnDistribution.mediumCvss,
    },
    {
      variant: "low" as const,
      risk: orgStatistics?.vulnDistribution.low,
      cvss: orgStatistics?.vulnDistribution.lowCvss,
    },
  ];

  return (
    <Section
      forceVertical
      title="Total Vulnerability Distribution"
      description="Distribution of open vulnerabilities across the organization, along with the most common vulnerabilities and components."
      className="mt-16"
    >
      <div className="grid grid-cols-4 gap-4">
        {severities.map(({ variant, risk, cvss }) => (
          <SeverityCard
            key={variant}
            variant={variant}
            isLoading={isStatisticsLoading}
            currentAmount={(mode === "risk" ? risk : cvss) ?? 0}
            mode={mode}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <MostUsedComponents
          topComponents={orgStatistics?.topComponents ?? []}
        />
        <MostCommonCVEs topCVEs={orgStatistics?.topCVEs ?? []} />
      </div>
      <div>
        <RiskHistoryDistributionDiagram
          data={riskHistory}
          isLoading={isStatisticsLoading}
          mode={mode}
        />
      </div>
    </Section>
  );
}
