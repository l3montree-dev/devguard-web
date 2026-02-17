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

import { RiskHistory } from "src/types/api/api";
import { fetcher } from "src/data-fetcher/fetcher";
import { useActiveOrg } from "src/hooks/useActiveOrg";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import  Section  from "src/components/common/Section";
import SeverityCard from "src/components/SeverityCard";
import useSWR from "swr";


const OrganizationOverview: FunctionComponent  = () => {
    const activeOrg = useActiveOrg();
    const orgSlug = activeOrg.slug
    const url = "/organizations/" + orgSlug

    const orgMenu = useOrganizationMenu();
    const [mode, setMode] = useViewMode("devguard-org-view-mode");
    
    const {data : vulnDistribution, isLoading : isVulnLoading} = useSWR<RiskHistory>(url + "/stats/vuln-statistics/",fetcher)
    
    return (
        <Page Menu={orgMenu} title="Overview" description="Displays an overview about the stats of the org" Title={null} >
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