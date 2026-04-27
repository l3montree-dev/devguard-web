// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import Section from "@/components/common/Section";
import MostUsedEcosystems from "@/components/organization/MostUsedEcosystems";
import StructureCard from "@/components/organization/StructureCard";
import MostVulnerableList from "@/components/organization/MostVulnerableList";
import DependencyAge from "@/components/organization/DependencyAge";
import type { OrgOverview, VulnDistributionInStructure } from "@/types/api/api";

export interface OrganizationCompositionSectionProps {
  mode: "risk" | "cvss";
  isStatisticsLoading: boolean;
  orgStatistics: OrgOverview | undefined;
}

interface StructureColumn {
  type: "Projects" | "Assets" | "Artifacts";
  listTitle: string;
  count: number | undefined;
  entries: VulnDistributionInStructure[];
}

export default function OrganizationCompositionSection({
  mode,
  isStatisticsLoading,
  orgStatistics,
}: OrganizationCompositionSectionProps) {
  const columns: StructureColumn[] = [
    {
      type: "Projects",
      listTitle: "Most Vulnerable Groups",
      count: orgStatistics?.structure.numProjects,
      entries: orgStatistics?.topProjects ?? [],
    },
    {
      type: "Assets",
      listTitle: "Most Vulnerable Repositories",
      count: orgStatistics?.structure.numAssets,
      entries: orgStatistics?.topAssets ?? [],
    },
    {
      type: "Artifacts",
      listTitle: "Most Vulnerable Artifacts",
      count: orgStatistics?.structure.numArtifacts,
      entries: orgStatistics?.topArtifacts ?? [],
    },
  ];

  return (
    <Section
      forceVertical
      title="Organization Composition"
      description="Structure breakdown, ecosystem distribution, and most prevalent dependencies and CVEs."
      className="mt-12"
    >
      <div className="grid grid-cols-3 gap-4">
        {columns.map(({ type, listTitle, count, entries }) => (
          <div key={type} className="flex flex-col gap-4">
            <StructureCard
              type={type}
              currentAmount={count ?? 0}
              isLoading={isStatisticsLoading}
            />
            <MostVulnerableList
              title={listTitle}
              type={type}
              entries={entries}
              mode={mode}
              isLoading={isStatisticsLoading}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <MostUsedEcosystems ecosystems={orgStatistics?.topEcosystems ?? []} />
        <DependencyAge averageAge={orgStatistics?.averageAgeOfDependencies} />
      </div>
    </Section>
  );
}
