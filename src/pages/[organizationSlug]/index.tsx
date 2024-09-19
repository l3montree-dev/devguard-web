// Copyright (C) 2023 Tim Bastin, Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { middleware } from "@/decorators/middleware";
import { GetServerSidePropsContext } from "next";
import { FunctionComponent } from "react";
import Page from "../../components/Page";
import { withOrgs } from "../../decorators/withOrgs";
import { withSession } from "../../decorators/withSession";
import { useActiveOrg } from "../../hooks/useActiveOrg";

import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { withOrganization } from "@/decorators/withOrganization";
import {
  AssetDTO,
  AverageFixingTime,
  DependencyCountByScanType,
  FlawAggregationStateAndChange,
  FlawCountByScanner,
  OrganizationDTO,
  ProjectDTO,
  RiskDistribution,
  RiskHistory,
} from "@/types/api/api";
import { Project } from "@/types/common";
import AverageFixingTimeChart from "@/components/overview/AverageFixingTimeChart";
import FlawAggregationState from "@/components/overview/FlawAggregationState";
import { RiskDistributionDiagram } from "@/components/overview/RiskDistributionDiagram";
import { RiskHistoryChart } from "@/components/overview/RiskHistoryDiagram";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { classNames, beautifyPurl } from "@/utils/common";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { getApiClientFromContext } from "@/services/devGuardApi";

interface Props {
  organization: OrganizationDTO & {
    projects: Array<
      ProjectDTO & {
        assets: Array<AssetDTO>;
      }
    >;
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

const Home: FunctionComponent<Props> = ({
  organization,
  riskDistribution,
  riskHistory,
  flawAggregationStateAndChange,
  avgLowFixingTime,
  avgMediumFixingTime,
  avgHighFixingTime,
  avgCriticalFixingTime,
}) => {
  const orgMenu = useOrganizationMenu();

  return (
    <Page
      Title={
        <Link
          href={`/${organization.slug}`}
          className="flex flex-row items-center gap-1 !text-white hover:no-underline"
        >
          {organization.name}{" "}
          <Badge
            className="font-body font-normal !text-white"
            variant="outline"
          >
            Organization
          </Badge>
        </Link>
      }
      title={organization.name ?? "Loading..."}
      Menu={orgMenu}
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
              <CardTitle>Vulnerable Projects</CardTitle>
              <CardDescription>
                The most vulnerable Projects in this organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                {riskHistory.slice(0, 5).map((r) => (
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
      <DependenciesPieChart data={dependencyCountByScanType} />
    </div> */}
      </div>
    </Page>
  );
};

export default Home;

const extractDateOnly = (date: Date) => date.toISOString().split("T")[0];

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext, { organization }) => {
    const { organizationSlug } = context.params!;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const last3Month = new Date();
    last3Month.setMonth(last3Month.getMonth() - 3);

    const apiClient = getApiClientFromContext(context);
    const url = "/organizations/" + organizationSlug + "/stats";
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
            Array<{ riskHistory: RiskHistory[]; project: ProjectDTO }>
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
            id: r.project.id,
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
            id: r.project.id,
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
        organization,
        riskDistribution,
        riskHistory: riskHistory.map((r) => ({
          label: r.project.name,
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
  },
);
