"use client"

import { FunctionComponent } from "react";
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
import MostUsedComponents from "@/components/organization/MostUsedComponents";
import MostCommonCVEs from "@/components/organization/MostCommonCVEs";


const OrganizationOverview: FunctionComponent  = () => {
    const activeOrg = useActiveOrg();
    const orgSlug = activeOrg.slug
    const url = "/organizations/" + orgSlug

    const orgMenu = useOrganizationMenu();
    const [mode, setMode] = useViewMode("devguard-org-view-mode");
        
    const {data : orgStatistics, isLoading : isStatisticsLoading} = useSWR<OrgOverview>(url + "/stats/vuln-statistics/",fetcher)

    return (
        <Page Menu={orgMenu} title="Overview" description="Displays an overview about the stats of the org" Title={null} >
            <div className="flex mt-16 gap-12 justify-center mb-20 items-start">
                <StructureCard topEntries={orgStatistics?.topProjects ?? []} isLoading={isStatisticsLoading} mode={mode} type="Projects" currentAmount={orgStatistics?.structure.numProjects ?? 0}/>
                <StructureCard topEntries={orgStatistics?.topAssets ?? []} isLoading={isStatisticsLoading} mode={mode} type="Assets" currentAmount={orgStatistics?.structure.numAssets ?? 0}/>
                <StructureCard topEntries={orgStatistics?.topArtifacts ?? []} isLoading={isStatisticsLoading} mode={mode} type="Artifacts" currentAmount={orgStatistics?.structure.numArtifacts ?? 0}/>
            </div>
                <Tabs
                    value={mode}
                    onValueChange={(value) => setMode(value as "risk" | "cvss")}
                    className="w-full"
                >
                    <div className="flex justify-center mb-6">
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
                            currentAmount={(mode === "risk" ? orgStatistics?.vulnDistribution.criticalRisk : orgStatistics?.vulnDistribution.criticalCVSS) ??  0}
                            mode={mode}
                            />
                            <SeverityCard
                            variant="high"
                            isLoading={isStatisticsLoading}
                            currentAmount={(mode === "risk" ? orgStatistics?.vulnDistribution.highRisk : orgStatistics?.vulnDistribution.highCVSS) ?? 0}
                            mode={mode}
                            />
                            <SeverityCard
                            variant="medium"
                            isLoading={isStatisticsLoading}
                            currentAmount={(mode === "risk" ? orgStatistics?.vulnDistribution.mediumRisk : orgStatistics?.vulnDistribution.mediumCVSS) ?? 0}
                            mode={mode}
                            />
                            <SeverityCard
                            variant="low"
                            isLoading={isStatisticsLoading}
                            currentAmount={(mode === "risk" ? orgStatistics?.vulnDistribution.lowRisk : orgStatistics?.vulnDistribution.lowCVSS) ?? 0}
                            mode={mode}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
                <Section
                    primaryHeadline
                    forceVertical
                    description="Have a look at the stats of dependencies in your org"
                    title="Dependency Overview"
                    className="mt-16"
                >   
                <div className="mt-2 flex flex-row gap-12">
                    <MostUsedComponents topComponents={orgStatistics?.topComponents ?? []}/>
                    <MostCommonCVEs topCVEs={orgStatistics?.topCVEs ?? []}/>
                </div>
                    
                </Section>
        </Page>
    )
}

export default OrganizationOverview