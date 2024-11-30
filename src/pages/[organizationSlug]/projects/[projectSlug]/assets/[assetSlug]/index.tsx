import Page from "@/components/Page";

import { RiskDistributionDiagram } from "@/components/overview/RiskDistributionDiagram";

import { Badge } from "@/components/ui/badge";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrganization } from "@/decorators/withOrganization";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";

import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { getApiClientFromContext } from "@/services/devGuardApi";
import {
  AverageFixingTime,
  ComponentRisk,
  DependencyCountByScanType,
  FlawAggregationStateAndChange,
  FlawCountByScanner,
  RiskDistribution,
  RiskHistory,
} from "@/types/api/api";
import { GetServerSidePropsContext } from "next";

import FlawAggregationState from "@/components/overview/FlawAggregationState";
import { RiskHistoryChart } from "@/components/overview/RiskHistoryDiagram";
import { VulnerableComponents } from "@/components/overview/VulnerableComponents";
import Link from "next/link";
import { FunctionComponent } from "react";

import AverageFixingTimeChart from "@/components/overview/AverageFixingTimeChart";
import { withContentTree } from "@/decorators/withContentTree";
import EmptyOverview from "@/components/common/EmptyOverview";
import { useRouter } from "next/router";

interface Props {
  componentRisk: ComponentRisk;
  riskDistribution: RiskDistribution | null;
  riskHistory: RiskHistory[];
  flawCountByScanner: FlawCountByScanner;
  dependencyCountByScanType: DependencyCountByScanType;
  flawAggregationStateAndChange: FlawAggregationStateAndChange;
  avgLowFixingTime: AverageFixingTime;
  avgMediumFixingTime: AverageFixingTime;
  avgHighFixingTime: AverageFixingTime;
  avgCriticalFixingTime: AverageFixingTime;
}

const Index: FunctionComponent<Props> = ({
  componentRisk,
  riskDistribution,
  riskHistory,
  flawAggregationStateAndChange,
  avgLowFixingTime,
  avgMediumFixingTime,
  avgHighFixingTime,
  avgCriticalFixingTime,
}) => {
  const activeOrg = useActiveOrg();
  const assetMenu = useAssetMenu();
  const project = useActiveProject();
  const asset = useActiveAsset()!;

  const router = useRouter();
  if (riskHistory.length === 0) {
    return (
      <Page
        Menu={assetMenu}
        title="Overview"
        description="Overview of the asset"
        Title={
          <span className="flex flex-row gap-2">
            <Link
              href={`/${activeOrg.slug}/projects`}
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
              href={`/${activeOrg.slug}/projects/${project?.slug}/assets`}
            >
              {project?.name}
              <Badge
                className="font-body font-normal !text-white"
                variant="outline"
              >
                Project
              </Badge>
            </Link>
            <span className="opacity-75">/</span>
            <Link
              className="flex items-center gap-1 text-white hover:no-underline"
              href={`/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}/risk-handling`}
            >
              {asset?.name}
              <Badge
                className="font-body font-normal !text-white"
                variant="outline"
              >
                Asset
              </Badge>
            </Link>
          </span>
        }
      >
        <EmptyOverview
          title="No data available"
          description="There is no data available for this asset. Please run a scan to get data."
          onClick={() =>
            router.push(
              `/${activeOrg.slug}/projects/${project?.slug}/assets/${asset?.slug}/security-control-center`,
            )
          }
          buttonTitle="Run a scan"
        />
      </Page>
    );
  }

  return (
    <Page
      Menu={assetMenu}
      title="Overview"
      description="Overview of the asset"
      Title={
        <span className="flex flex-row gap-2">
          <Link
            href={`/${activeOrg.slug}/projects`}
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
            href={`/${activeOrg.slug}/projects/${project?.slug}/assets`}
          >
            {project?.name}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Project
            </Badge>
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="flex items-center gap-1 text-white hover:no-underline"
            href={`/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}/risk-handling`}
          >
            {asset?.name}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Asset
            </Badge>
          </Link>
        </span>
      }
    >
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-semibold">Overview</h1>
      </div>
      <div className="mt-4 grid gap-4">
        <FlawAggregationState
          title="Asset Risk"
          description="The total risk this asset poses to the organization"
          totalRisk={riskHistory[riskHistory.length - 1]?.sumOpenRisk ?? 0}
          data={flawAggregationStateAndChange}
        />
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <RiskDistributionDiagram
              data={riskDistribution ? [riskDistribution] : []}
            />
          </div>
          <VulnerableComponents data={componentRisk} />
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
        <RiskHistoryChart
          data={[{ label: asset.name, history: riskHistory }]}
        />
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
  async (context: GetServerSidePropsContext) => {
    const { organizationSlug, projectSlug, assetSlug } = context.params!;

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
      "/assets/" +
      assetSlug +
      "/stats";
    const [
      componentRisk,
      riskDistribution,
      riskHistory,
      flawAggregationStateAndChange,
      avgLowFixingTime,
      avgMediumFixingTime,
      avgHighFixingTime,
      avgCriticalFixingTime,
    ] = await Promise.all([
      apiClient(url + "/component-risk").then((r) => r.json()),
      apiClient(url + "/risk-distribution").then((r) => r.json()),
      apiClient(
        url +
          "/risk-history?start=" +
          extractDateOnly(last3Month) +
          "&end=" +
          extractDateOnly(new Date()),
      ).then((r) => r.json()),
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

    return {
      props: {
        componentRisk,
        riskDistribution,
        riskHistory,
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
    asset: withAsset,
    contentTree: withContentTree,
  },
);
