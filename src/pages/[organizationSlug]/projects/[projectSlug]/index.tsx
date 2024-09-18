import { GetServerSidePropsContext } from "next";
import { FunctionComponent } from "react";
import Page from "../../../../components/Page";

import { middleware } from "@/decorators/middleware";

import AverageFixingTimeChart from "@/components/overview/AverageFixingTimeChart";
import FlawAggregationState from "@/components/overview/FlawAggregationState";
import { RiskDistributionDiagram } from "@/components/overview/RiskDistributionDiagram";
import { RiskHistoryChart } from "@/components/overview/RiskHistoryDiagram";
import { Badge } from "@/components/ui/badge";
import { withOrganization } from "@/decorators/withOrganization";
import { withProject } from "@/decorators/withProject";
import { useProjectMenu } from "@/hooks/useProjectMenu";
import Link from "next/link";
import { withOrgs } from "../../../../decorators/withOrgs";
import { withSession } from "../../../../decorators/withSession";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import { getApiClientFromContext } from "../../../../services/devGuardApi";
import {
  AssetDTO,
  AverageFixingTime,
  DependencyCountByScanType,
  FlawAggregationStateAndChange,
  FlawCountByScanner,
  ProjectDTO,
  RiskDistribution,
  RiskHistory,
} from "../../../../types/api/api";
import EcosystemImage from "@/components/common/EcosystemImage";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { classNames, beautifyPurl, extractVersion } from "@/utils/common";
import d from "react-syntax-highlighter/dist/esm/languages/hljs/d";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/router";

interface Props {
  project: ProjectDTO & {
    assets: Array<AssetDTO>;
  };
  riskDistribution: RiskDistribution[] | null;
  riskHistory: Array<{ history: RiskHistory[]; label: string }>;
  flawCountByScanner: FlawCountByScanner;
  dependencyCountByScanType: DependencyCountByScanType;
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

  return (
    <Page
      title={project.name}
      Menu={projectMenu}
      Title={
        <span className="flex flex-row gap-2">
          <Link
            href={`/${activeOrg.slug}`}
            className="flex flex-row items-center gap-1 !text-white hover:no-underline"
          >
            {activeOrg.name}{" "}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Organization
            </Badge>
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="flex flex-row items-center gap-1 !text-white hover:no-underline"
            href={`/${activeOrg.slug}/projects/${project.slug}`}
          >
            {project.name}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Project
            </Badge>
          </Link>
        </span>
      }
    >
      {" "}
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
              <div className="flex flex-col gap-6">
                {riskHistory.slice(0, 5).map(
                  (r) => (
                    console.log("r", r),
                    (
                      <div
                        key={r.label}
                        className={classNames("flex items-center gap-4")}
                      >
                        <div className="rounded-full bg-muted p-1">
                          <Avatar>
                            <AvatarFallback>{r.label[0]}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="grid gap-1">
                          <p className="text-sm font-medium leading-none">
                            {beautifyPurl(r.label)}
                          </p>
                        </div>
                        <div className="ml-auto font-medium">
                          {" "}
                          {r.history[r.history.length - 1].sumOpenRisk.toFixed(
                            2,
                          )}{" "}
                          <small className="text-muted-foreground">Risk</small>
                        </div>
                      </div>
                    )
                  ),
                )}
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
      <DependenciesPieChart data={dependencyCountByScanType} />
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
            Array<{ riskHistory: RiskHistory[]; asset: AssetDTO }>
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

    const lengths = riskHistory.map((r) => r.riskHistory.length);
    const max = Math.max(...lengths);

    // check if some array needs to be padded
    riskHistory.forEach((r) => {
      if (r.riskHistory.length === max) {
        return r;
      }
      if (r.riskHistory.length === 0) {
        r.riskHistory = [
          {
            day: new Date().toUTCString(),
            id: r.asset.id,
            sumClosedRisk: 0,
            sumOpenRisk: 0,
            maxClosedRisk: 0,
            maxOpenRisk: 0,
            averageClosedRisk: 0,
            averageOpenRisk: 0,
            openFlaws: 0,
            fixedFlaws: 0,
            minClosedRisk: 0,
            minOpenRisk: 0,
          },
        ];
        return r;
      }
      // it is smaller - thus we need to prepend fake elements
      let firstDay = new Date(r.riskHistory[0].day);
      while (r.riskHistory.length < max) {
        // decrement firstDay by 1 day
        const clone = new Date(firstDay);
        clone.setTime(clone.getTime() - 24 * 60 * 60 * 60);
        r.riskHistory = [
          {
            day: clone.toUTCString(),
            id: r.asset.id,
            sumClosedRisk: 0,
            sumOpenRisk: 0,
            maxClosedRisk: 0,
            maxOpenRisk: 0,
            averageClosedRisk: 0,
            averageOpenRisk: 0,
            openFlaws: 0,
            fixedFlaws: 0,
            minClosedRisk: 0,
            minOpenRisk: 0,
          },
          ...r.riskHistory,
        ];
      }
    });

    riskHistory.sort(
      (a, b) =>
        b.riskHistory[b.riskHistory.length - 1].sumOpenRisk -
        a.riskHistory[a.riskHistory.length - 1].sumOpenRisk,
    );

    return {
      props: {
        project,
        riskDistribution,
        riskHistory: riskHistory.map((r) => ({
          label: r.asset.name,
          history: r.riskHistory,
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
  },
);
