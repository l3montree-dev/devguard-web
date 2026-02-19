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

import { RiskHistory, OrgStructure } from "src/types/api/api";
import { fetcher } from "src/data-fetcher/fetcher";
import { useActiveOrg } from "src/hooks/useActiveOrg";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import  Section  from "src/components/common/Section";
import SeverityCard from "src/components/SeverityCard";
import StructureCard from "src/components/organization/StructureCard"
import useSWR from "swr";


const OrganizationOverview: FunctionComponent  = () => {
    const activeOrg = useActiveOrg();
    const orgSlug = activeOrg.slug
    const url = "/organizations/" + orgSlug

    const orgMenu = useOrganizationMenu();
    const [mode, setMode] = useViewMode("devguard-org-view-mode");
        
    const {data : vulnDistribution, isLoading : isVulnLoading} = useSWR<RiskHistory>(url + "/stats/vuln-statistics/",fetcher)
    const {data : orgStructure, isLoading : isStructureLoading} = useSWR<OrgStructure>(url + "/stats/org-structure/",fetcher)
    console.log(orgStructure)
    return (
        <Page Menu={orgMenu} title="Overview" description="Displays an overview about the stats of the org" Title={null} >
            <div className="flex mt-4 gap-12 justify-center mb-16">
                <StructureCard isLoading={isStructureLoading} mode="Projects" currentAmount={orgStructure?.numProjects ?? 0}/>
                <StructureCard isLoading={isStructureLoading} mode="Assets" currentAmount={orgStructure?.numAssets ?? 0}/>
                <StructureCard isLoading={isStructureLoading} mode="Artifacts" currentAmount={orgStructure?.numArtifacts ?? 0}/>
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
                            isLoading={isVulnLoading}
                            currentAmount={(mode === "risk" ? vulnDistribution?.criticalRisk : vulnDistribution?.criticalCvss) ??  0}
                            mode={mode}
                            />
                            <SeverityCard
                            variant="high"
                            isLoading={isVulnLoading}
                            currentAmount={(mode === "risk" ? vulnDistribution?.highRisk : vulnDistribution?.highCvss) ?? 0}
                            mode={mode}
                            />
                            <SeverityCard
                            variant="medium"
                            isLoading={isVulnLoading}
                            currentAmount={(mode === "risk" ? vulnDistribution?.mediumRisk : vulnDistribution?.mediumCvss) ?? 0}
                            mode={mode}
                            />
                            <SeverityCard
                            variant="low"
                            isLoading={isVulnLoading}
                            currentAmount={(mode === "risk" ? vulnDistribution?.lowRisk : vulnDistribution?.lowCvss) ?? 0}
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