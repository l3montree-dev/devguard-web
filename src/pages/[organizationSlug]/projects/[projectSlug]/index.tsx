import { GetServerSidePropsContext } from "next";
import { FunctionComponent } from "react";
import Page from "../../../../components/Page";

import { middleware } from "@/decorators/middleware";

import AverageFixingTimeChart from "@/components/overview/AverageFixingTimeChart";
import FlawAggregationState from "@/components/overview/FlawAggregationState";
import { RiskDistributionDiagram } from "@/components/overview/RiskDistributionDiagram";
import { RiskHistoryChart } from "@/components/overview/RiskHistoryDiagram";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { withOrganization } from "@/decorators/withOrganization";
import { withProject } from "@/decorators/withProject";
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
  FlawAggregationStateAndChange,
  FlawCountByScanner,
  ProjectDTO,
  RiskDistribution,
  RiskHistory,
} from "../../../../types/api/api";
import { useActiveProject } from "@/hooks/useActiveProject";
import { withContentTree } from "@/decorators/withContentTree";
import EmptyOverview from "@/components/common/EmptyOverview";
import { useRouter } from "next/router";
import { padRiskHistory } from "@/utils/server";
import ProjectTitle from "../../../../components/common/ProjectTitle";
import { Button } from "../../../../components/ui/button";

interface Props {
  project: ProjectDTO & {
    assets: Array<AssetDTO>;
  };
  riskDistribution: RiskDistribution[] | null;
  riskHistory: Array<{
    history: RiskHistory[];
    label: string;
    slug: string;
    description: string;
    type: "project" | "asset";
  }>;
  flawCountByScanner: FlawCountByScanner;
  dependencyCountByscanner: DependencyCountByscanner;
  flawAggregationStateAndChange: FlawAggregationStateAndChange;
  avgLowFixingTime: AverageFixingTime;
  avgMediumFixingTime: AverageFixingTime;
  avgHighFixingTime: AverageFixingTime;
  avgCriticalFixingTime: AverageFixingTime;
}

const Index: FunctionComponent<Props> = ({
  project,
  riskDistribution,
  riskHistory,
  flawAggregationStateAndChange,
  avgLowFixingTime,
  avgMediumFixingTime,
  avgHighFixingTime,
  avgCriticalFixingTime,
}) => {
  const activeOrg = useActiveOrg();
  const projectMenu = useProjectMenu();
  const router = useRouter();
  const activeProject = useActiveProject();

  if (riskHistory.length === 0) {
    return (
      <Page title={project.name} Menu={projectMenu} Title={<ProjectTitle />}>
        <EmptyOverview
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

  console.log(riskDistribution);
  return (
    <Page title={project.name} Menu={projectMenu} Title={<ProjectTitle />}>
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-semibold">Overview</h1>
      </div>
      <div className="mt-4 grid gap-4">
        <FlawAggregationState
          description="The total risk this project poses to the organization"
          title="Project Risk"
          totalRisk={riskHistory
            .map((r) => r.history[r.history.length - 1])
            .filter((r) => !!r)
            .reduce((acc, curr) => acc + curr.sumOpenRisk, 0)}
          data={flawAggregationStateAndChange}
        />
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <RiskDistributionDiagram data={riskDistribution ?? []} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vulnerable Assets</CardTitle>
              <CardDescription>
                The most vulnerable assets in this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {riskHistory.slice(0, 5).map((r) => (
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
                    className="-mx-2 rounded-lg px-2 py-2 !text-card-foreground transition-all hover:bg-background hover:no-underline"
                  >
                    <div
                      key={r.label}
                      className={classNames("flex items-center gap-4")}
                    >
                      <Avatar>
                        <AvatarFallback>{r.label[0]}</AvatarFallback>
                      </Avatar>

                      <div className="grid">
                        <p className="text-sm font-medium leading-none">
                          {beautifyPurl(r.label)}
                        </p>
                        <small className="line-clamp-1 text-ellipsis text-muted-foreground">
                          {r.description}
                        </small>
                      </div>
                      <div className="ml-auto font-medium">
                        <Badge
                          className="whitespace-nowrap"
                          variant="secondary"
                        >
                          {r.history[r.history.length - 1]?.sumOpenRisk.toFixed(
                            2,
                          ) ?? "0.00"}{" "}
                          Risk
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-4"></div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <AverageFixingTimeChart
            title="Low severity"
            description="Average fixing time for low severity flaws"
            avgFixingTime={avgLowFixingTime}
          />
          <AverageFixingTimeChart
            title="Medium severity"
            description="Average fixing time for medium severity flaws"
            avgFixingTime={avgMediumFixingTime}
          />
          <AverageFixingTimeChart
            title="High severity"
            description="Average fixing time for high severity flaws"
            avgFixingTime={avgHighFixingTime}
          />
          <AverageFixingTimeChart
            title="Critical severity"
            description="Average fixing time for critical severity flaws"
            avgFixingTime={avgCriticalFixingTime}
          />
        </div>
        <RiskHistoryChart data={riskHistory} />
        {/* <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2"></div>
      <DependenciesPieChart data={dependencyCountByscanner} />
    </div> */}
      </div>
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
      riskDistribution,
      riskHistory,
      flawAggregationStateAndChange,
      avgLowFixingTime,
      avgMediumFixingTime,
      avgHighFixingTime,
      avgCriticalFixingTime,
    ] = await Promise.all([
      apiClient(url + "/risk-distribution").then((r) => r.json()),
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
        riskDistribution,
        riskHistory: paddedRiskHistory.map((r) => ({
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
