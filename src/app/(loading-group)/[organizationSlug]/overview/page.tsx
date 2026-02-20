"use client"

import { FunctionComponent, useState } from "react";
import Page from "../../../../components/Page";
import { useViewMode } from "src/hooks/useViewMode";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "src/components/ui/tabs";

import { OrgOverview } from "src/types/api/api";
import { fetcher } from "src/data-fetcher/fetcher";
import { useActiveOrg } from "src/hooks/useActiveOrg";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import  Section  from "src/components/common/Section";
import SeverityCard from "src/components/SeverityCard";
import StructureCard from "src/components/organization/StructureCard"
import useSWR from "swr";

import {
  Card,
} from "src/components/ui/card";
import { Skeleton } from "src/components/ui/skeleton";


const OrganizationOverview: FunctionComponent  = () => {
    const activeOrg = useActiveOrg();
    const orgSlug = activeOrg.slug
    const url = "/organizations/" + orgSlug

    const orgMenu = useOrganizationMenu();
    const [mode, setMode] = useViewMode("devguard-org-view-mode");
        
    const {data : orgStatistics, isLoading : isStatisticsLoading} = useSWR<OrgOverview>(url + "/stats/vuln-statistics/",fetcher)
    console.log(orgStatistics)

    return (
        <Page Menu={orgMenu} title="Overview" description="Displays an overview about the stats of the org" Title={null} >
            <div className="flex mt-4 gap-12 justify-center mb-16 items-start">
                <StructureCard topEntries={orgStatistics?.topProjects ?? []} isLoading={isStatisticsLoading} mode="Projects" currentAmount={orgStatistics?.structure.numProjects ?? 0}/>
                <StructureCard topEntries={orgStatistics?.topAssets ?? []} isLoading={isStatisticsLoading} mode="Assets" currentAmount={orgStatistics?.structure.numAssets ?? 0}/>
                <StructureCard topEntries={orgStatistics?.topArtifacts ?? []} isLoading={isStatisticsLoading} mode="Artifacts" currentAmount={orgStatistics?.structure.numArtifacts ?? 0}/>
            </div>
            <Section
                primaryHeadline
                forceVertical
                description="Have a look at the overall status of your organization"
                title="Overview"
            >
                <Tabs
                    value={mode}
                    onValueChange={(value) => setMode(value as "risk" | "cvss")}
                    className="w-full"
                >
                    <div className="mb-4 flex">
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
                            currentAmount={(mode === "risk" ? orgStatistics?.vulnDistribution.riskDistribution.criticalRisk : orgStatistics?.vulnDistribution.cvssDistribution.criticalCVSS) ??  0}
                            mode={mode}
                            />
                            <SeverityCard
                            variant="high"
                            isLoading={isStatisticsLoading}
                            currentAmount={(mode === "risk" ? orgStatistics?.vulnDistribution.riskDistribution.highRisk : orgStatistics?.vulnDistribution.cvssDistribution.highCVSS) ?? 0}
                            mode={mode}
                            />
                            <SeverityCard
                            variant="medium"
                            isLoading={isStatisticsLoading}
                            currentAmount={(mode === "risk" ? orgStatistics?.vulnDistribution.riskDistribution.mediumRisk : orgStatistics?.vulnDistribution.cvssDistribution.mediumCVSS) ?? 0}
                            mode={mode}
                            />
                            <SeverityCard
                            variant="low"
                            isLoading={isStatisticsLoading}
                            currentAmount={(mode === "risk" ? orgStatistics?.vulnDistribution.riskDistribution.lowRisk : orgStatistics?.vulnDistribution.cvssDistribution.lowCVSS) ?? 0}
                            mode={mode}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </Section>
        </Page>
    )
}

export default OrganizationOverview