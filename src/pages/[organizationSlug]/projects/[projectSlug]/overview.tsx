import { GetServerSidePropsContext } from "next";
import { FunctionComponent, useState, useEffect } from "react";
import Page from "../../../../components/Page";
import { middleware } from "@/decorators/middleware";
import { useViewMode } from "@/hooks/useViewMode";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { withContentTree } from "@/decorators/withContentTree";
import { withOrganization } from "@/decorators/withOrganization";
import { withProject } from "@/decorators/withProject";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useProjectMenu } from "@/hooks/useProjectMenu";
import { beautifyPurl, classNames } from "@/utils/common";
import Link from "next/link";
import { withOrgs } from "../../../../decorators/withOrgs";
import { withSession } from "../../../../decorators/withSession";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import { getApiClientFromContext } from "../../../../services/devGuardApi";
import {
  AssetDTO,
  AverageFixingTime,
  DependencyCountByscanner,
  ProjectDTO,
  RiskDistribution,
  RiskHistory,
  VulnAggregationStateAndChange,
  VulnCountByScanner,
} from "../../../../types/api/api";

import { padRiskHistory } from "@/utils/server";
import { useRouter } from "next/router";
import Avatar from "../../../../components/Avatar";
import AverageFixingTimeChart from "../../../../components/AverageFixingTimeChart";
import EmptyParty from "../../../../components/common/EmptyParty";
import ProjectTitle from "../../../../components/common/ProjectTitle";
import Section from "../../../../components/common/Section";
import CVERainbowBadge from "../../../../components/CVERainbowBadge";
import { RiskHistoryDistributionDiagram } from "../../../../components/RiskHistoryDistributionDiagram";
import SeverityCard from "../../../../components/SeverityCard";
import { Button } from "../../../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";

interface Props {
  project: ProjectDTO & {
    assets: Array<AssetDTO>;
  };
  riskHistory: Array<{
    history: RiskHistory[];
    label: string;
    slug: string;
    description: string;
    type: "project" | "asset";
    avatar: string;
  }>;
  flawCountByScanner: VulnCountByScanner;
  dependencyCountByscanner: DependencyCountByscanner;
  flawAggregationStateAndChange: VulnAggregationStateAndChange;
  avgLowFixingTime: AverageFixingTime;
  avgMediumFixingTime: AverageFixingTime;
  avgHighFixingTime: AverageFixingTime;
  avgCriticalFixingTime: AverageFixingTime;
}

const Index: FunctionComponent<Props> = ({
  project,
  riskHistory,
  avgLowFixingTime,
  avgMediumFixingTime,
  avgHighFixingTime,
  avgCriticalFixingTime,
}) => {
  const [mode, setMode] = useViewMode("devguard-view-mode");
  const activeOrg = useActiveOrg();
  const projectMenu = useProjectMenu();
  const router = useRouter();
  const activeProject = useActiveProject();

  if (riskHistory.length === 0) {
    return (
      <Page title={project.name} Menu={projectMenu} Title={<ProjectTitle />}>
        <EmptyParty
          title={"No data available for this project"}
          Button={
            <Button
              onClick={() => {
                router.push(
                  `/${activeOrg.slug}/projects/${project.slug}/assets`,
                );
              }}
            >
              Create new asset
            </Button>
          }
          description="Create an asset and start scanning it to see the data here."
        />
      </Page>
    );
  }

  return (
    <Page title={project.name} Menu={projectMenu} Title={<ProjectTitle />}>
      <Section
        primaryHeadline
        forceVertical
        description="Have a look at the overall health of your group and its repositories."
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
                currentAmount={
                  mode === "risk"
                    ? riskHistory.reduce(
                        (sum, r) =>
                          sum +
                          (r.history[r.history.length - 1]?.critical ?? 0),
                        0,
                      )
                    : riskHistory.reduce(
                        (sum, r) =>
                          sum +
                          (r.history[r.history.length - 1]?.criticalCvss ?? 0),
                        0,
                      )
                }
                queryIntervalStart={7}
                queryIntervalEnd={10}
                mode={mode}
              />
              <SeverityCard
                variant="high"
                currentAmount={
                  mode === "risk"
                    ? riskHistory.reduce(
                        (sum, r) =>
                          sum + (r.history[r.history.length - 1]?.high ?? 0),
                        0,
                      )
                    : riskHistory.reduce(
                        (sum, r) =>
                          sum +
                          (r.history[r.history.length - 1]?.highCvss ?? 0),
                        0,
                      )
                }
                queryIntervalStart={4}
                queryIntervalEnd={7}
                mode={mode}
              />
              <SeverityCard
                variant="medium"
                currentAmount={
                  mode === "risk"
                    ? riskHistory.reduce(
                        (sum, r) =>
                          sum + (r.history[r.history.length - 1]?.medium ?? 0),
                        0,
                      )
                    : riskHistory.reduce(
                        (sum, r) =>
                          sum +
                          (r.history[r.history.length - 1]?.mediumCvss ?? 0),
                        0,
                      )
                }
                queryIntervalStart={1}
                queryIntervalEnd={4}
                mode={mode}
              />
              <SeverityCard
                variant="low"
                currentAmount={
                  mode === "risk"
                    ? riskHistory.reduce(
                        (sum, r) =>
                          sum + (r.history[r.history.length - 1]?.low ?? 0),
                        0,
                      )
                    : riskHistory.reduce(
                        (sum, r) =>
                          sum + (r.history[r.history.length - 1]?.lowCvss ?? 0),
                        0,
                      )
                }
                queryIntervalStart={0}
                queryIntervalEnd={1}
                mode={mode}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="grid grid-cols-2 col-span-2 gap-4">
                <AverageFixingTimeChart
                  variant="critical"
                  title="Avg. remediation time"
                  description="Average fixing time for critical severity flaws"
                  avgFixingTime={avgCriticalFixingTime}
                />
                <AverageFixingTimeChart
                  title="Avg. remediation time"
                  variant="high"
                  description="Average fixing time for high severity flaws"
                  avgFixingTime={avgHighFixingTime}
                />
                <AverageFixingTimeChart
                  title="Avg. remediation time"
                  variant="medium"
                  description="Average fixing time for medium severity flaws"
                  avgFixingTime={avgMediumFixingTime}
                />
                <AverageFixingTimeChart
                  title="Avg. remediation time"
                  variant="low"
                  description="Average fixing time for low severity flaws"
                  avgFixingTime={avgLowFixingTime}
                />
              </div>

              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Vulnerable Repositories</CardTitle>
                  <CardDescription>
                    The most vulnerable assets in this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {riskHistory.slice(0, 7).map((r, i, arr) => {
                      const riskHistoryLastElement =
                        r.history[r.history.length - 1];
                      return (
                        <Link
                          href={
                            r.type === "project"
                              ? "/" + activeOrg.slug + "/projects/" + r.slug
                              : "/" +
                                activeOrg.slug +
                                "/projects/" +
                                activeProject?.slug +
                                "/assets/" +
                                r.slug
                          }
                          key={r.slug}
                          className={classNames(
                            i === 0
                              ? "border-b pb-4"
                              : i === arr.length - 1
                                ? "pt-4"
                                : "border-b py-4",
                            "flex items-center flex-row gap-4",
                          )}
                        >
                          <Avatar name={r.label} avatar={r.avatar} />

                          <div>
                            <div className="mb-1 flex flex-row items-center gap-2 text-sm font-semibold">
                              <span className="capitalize text-foreground">
                                {beautifyPurl(r.label)}
                              </span>
                              <div className="flex flex-row flex-wrap gap-2">
                                <CVERainbowBadge
                                  low={
                                    mode === "risk"
                                      ? (riskHistoryLastElement?.low ?? 0)
                                      : (riskHistoryLastElement?.lowCvss ?? 0)
                                  }
                                  medium={
                                    mode === "risk"
                                      ? (riskHistoryLastElement?.medium ?? 0)
                                      : (riskHistoryLastElement?.mediumCvss ??
                                        0)
                                  }
                                  high={
                                    mode === "risk"
                                      ? (riskHistoryLastElement?.high ?? 0)
                                      : (riskHistoryLastElement?.highCvss ?? 0)
                                  }
                                  critical={
                                    mode === "risk"
                                      ? (riskHistoryLastElement?.critical ?? 0)
                                      : (riskHistoryLastElement?.criticalCvss ??
                                        0)
                                  }
                                />
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground">
                              {r.description
                                ? r.description
                                : "No description available"}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4"></div>
                </CardContent>
              </Card>
            </div>
            <div className="col-span-2">
              <RiskHistoryDistributionDiagram data={riskHistory} mode={mode} />
            </div>
          </TabsContent>
        </Tabs>
      </Section>
    </Page>
  );
};
export default Index;

const extractDateOnly = (date: Date) => date.toISOString().split("T")[0];

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext, { project }) => {
    const { organizationSlug, projectSlug } = context.params!;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const last3Month = new Date();
    last3Month.setMonth(last3Month.getMonth() - 3);

    const apiClient = getApiClientFromContext(context);
    const url =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/stats";
    const [
      riskHistory,
      flawAggregationStateAndChange,
      avgLowFixingTime,
      avgMediumFixingTime,
      avgHighFixingTime,
      avgCriticalFixingTime,
    ] = await Promise.all([
      apiClient(
        url +
          "/risk-history?start=" +
          extractDateOnly(last3Month) +
          "&end=" +
          extractDateOnly(new Date()),
      ).then(
        (r) =>
          r.json() as Promise<
            Array<
              | { riskHistory: RiskHistory[]; asset: AssetDTO }
              | {
                  riskHistory: [];
                  project: ProjectDTO;
                }
            >
          >,
      ),
      apiClient(
        url +
          "/flaw-aggregation-state-and-change?compareTo=" +
          lastMonth.toISOString().split("T")[0],
      ).then((r) => r.json()),
      apiClient(url + "/average-fixing-time?severity=low").then((r) =>
        r.json(),
      ),
      apiClient(url + "/average-fixing-time?severity=medium").then((r) =>
        r.json(),
      ),
      apiClient(url + "/average-fixing-time?severity=high").then((r) =>
        r.json(),
      ),
      apiClient(url + "/average-fixing-time?severity=critical").then((r) =>
        r.json(),
      ),
    ]);

    /*
    // check the longest array in the results
	longest := 0
	var firstDay *time.Time = nil
	for _, r := range results {
		if len(r.RiskHistory) > longest {
			longest = len(r.RiskHistory)
		}
		if len(r.RiskHistory) > 0 && (firstDay == nil || r.RiskHistory[0].Day.Before(*firstDay)) {
			firstDay = &r.RiskHistory[0].Day
		}
	}
    */
    const paddedRiskHistory = padRiskHistory(riskHistory);

    return {
      props: {
        project,

        riskHistory: paddedRiskHistory.map((r) => ({
          avatar: "asset" in r ? r.asset.avatar : r.project.avatar,
          label: "asset" in r ? r.asset.name : r.project.name,
          history: r.riskHistory,
          type: "asset" in r ? "asset" : "project",
          slug: "asset" in r ? r.asset.slug : r.project.slug,
          description:
            "asset" in r ? r.asset.description : r.project.description,
        })),
        flawAggregationStateAndChange,
        avgLowFixingTime,
        avgMediumFixingTime,
        avgHighFixingTime,
        avgCriticalFixingTime,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    project: withProject,
    contentTree: withContentTree,
  },
);
