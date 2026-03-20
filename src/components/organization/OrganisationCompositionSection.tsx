// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import Section from "@/components/common/Section";
import MostUsedEcosystems from "@/components/organization/MostUsedEcosystems";
import StructureCard from "@/components/organization/StructureCard";
import MostVulnerableList from "@/components/organization/MostVulnerableList";
import DependencyAge from "@/components/organization/DependencyAge";
import { OrgOverview } from "@/types/api/api";

export interface OrganisationCompositionSectionProps {
  mode: "risk" | "cvss";
  isStatisticsLoading: boolean;
  orgStatistics: OrgOverview | undefined;
}

export default function OrganisationCompositionSection({
  mode,
  isStatisticsLoading,
  orgStatistics,
}: OrganisationCompositionSectionProps) {
  return (
    <Section
      forceVertical
      title="Organization Composition"
      description="Structure breakdown, ecosystem distribution, and most prevalent dependencies and CVEs."
      className="mt-12"
    >
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-4">
          <StructureCard
            type="Projects"
            currentAmount={orgStatistics?.structure.numProjects ?? 0}
            isLoading={isStatisticsLoading}
          />
          <MostVulnerableList
            title="Most Vulnerable Groups"
            type="Projects"
            entries={orgStatistics?.topProjects ?? []}
            mode={mode}
            isLoading={isStatisticsLoading}
          />
        </div>
        <div className="flex flex-col gap-4">
          <StructureCard
            type="Assets"
            currentAmount={orgStatistics?.structure.numAssets ?? 0}
            isLoading={isStatisticsLoading}
          />
          <MostVulnerableList
            title="Most Vulnerable Repositories"
            type="Assets"
            entries={orgStatistics?.topAssets ?? []}
            mode={mode}
            isLoading={isStatisticsLoading}
          />
        </div>
        <div className="flex flex-col gap-4">
          <StructureCard
            type="Artifacts"
            currentAmount={orgStatistics?.structure.numArtifacts ?? 0}
            isLoading={isStatisticsLoading}
          />
          <MostVulnerableList
            title="Most Vulnerable Artifacts"
            type="Artifacts"
            entries={orgStatistics?.topArtifacts ?? []}
            mode={mode}
            isLoading={isStatisticsLoading}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <MostUsedEcosystems ecosystems={orgStatistics?.topEcosystems ?? []} />
        <DependencyAge averageAge={orgStatistics?.averageAgeOfDependencies} />
      </div>
    </Section>
  );
}
