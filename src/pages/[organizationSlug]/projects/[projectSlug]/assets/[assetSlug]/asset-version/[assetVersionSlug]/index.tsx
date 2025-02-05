import Page from "@/components/Page";

import { RiskDistributionDiagram } from "@/components/overview/RiskDistributionDiagram";

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
  AssetMetricsDTO,
  AverageFixingTime,
  ComponentRisk,
  DependencyCountByscanner,
  FlawAggregationStateAndChange,
  FlawCountByScanner,
  RiskDistribution,
  RiskHistory,
} from "@/types/api/api";
import "@xyflow/react/dist/style.css";
import { GetServerSidePropsContext } from "next";

import FlawAggregationState from "@/components/overview/FlawAggregationState";
import { RiskHistoryChart } from "@/components/overview/RiskHistoryDiagram";
import { VulnerableComponents } from "@/components/overview/VulnerableComponents";
import { FunctionComponent } from "react";

import AssetTitle from "@/components/common/AssetTitle";
import CollapsibleControlTrigger from "@/components/common/CollapsibleControlTrigger";
import EmptyOverview from "@/components/common/EmptyOverview";
import SDLC from "@/components/common/SDLC";
import Section from "@/components/common/Section";
import AverageFixingTimeChart from "@/components/overview/AverageFixingTimeChart";
import ThreatsMitigationsCollapsibles from "@/components/ssdlc/ThreatsMitigations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Collapsible } from "@/components/ui/collapsible";
import { withContentTree } from "@/decorators/withContentTree";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "../../../../../../../../components/ui/button";
import { withAssetVersion } from "@/decorators/withAssetVersion";
import { useActiveAssetVersion } from "@/hooks/useActiveAssetVersion";

interface Props {
  componentRisk: ComponentRisk;
  riskDistribution: RiskDistribution | null;
  riskHistory: RiskHistory[];
  flawCountByScanner: FlawCountByScanner;
  dependencyCountByscanner: DependencyCountByscanner;
  flawAggregationStateAndChange: FlawAggregationStateAndChange;
  avgLowFixingTime: AverageFixingTime;
  avgMediumFixingTime: AverageFixingTime;
  avgHighFixingTime: AverageFixingTime;
  avgCriticalFixingTime: AverageFixingTime;
  metrics: AssetMetricsDTO;
}

const metrics2CurrentEvidence = (metrics: AssetMetricsDTO) => {
  return (
    Number(metrics.enabledContainerScanning) +
    Number(metrics.enabledImageSigning) * 2 +
    Number(metrics.enabledSCA) +
    Number(Boolean(metrics.verifiedSupplyChainsPercentage > 0)) * 8
  );
};

const Index: FunctionComponent<Props> = ({
  componentRisk,
  riskDistribution,
  riskHistory,
  flawAggregationStateAndChange,
  avgLowFixingTime,
  avgMediumFixingTime,
  avgHighFixingTime,
  avgCriticalFixingTime,
  metrics,
}) => {
  const activeOrg = useActiveOrg();
  const assetMenu = useAssetMenu();
  const project = useActiveProject();
  const asset = useActiveAsset()!;

  const assetVersion = useActiveAssetVersion();

  console.log("assetVersion", assetVersion);

  const router = useRouter();
  if (riskHistory.length === 0) {
    return (
      <Page
        Menu={assetMenu}
        title="Overview"
        description="Overview of the asset"
        Title={<AssetTitle />}
      >
        <EmptyOverview
          title="No data available"
          description="There is no data available for this asset. Please run a scan to get data."
          Button={
            <Button
              onClick={() =>
                router.push(
                  `/${activeOrg.slug}/projects/${project?.slug}/assets/${asset?.slug}/security-control-center`,
                )
              }
              className="btn btn-primary"
            >
              Run a scan
            </Button>
          }
        />
      </Page>
    );
  }

  return (
    <Page
      Menu={assetMenu}
      title="Overview"
      description="Overview of the asset"
      Title={<AssetTitle />}
    >
      <Section
        primaryHeadline
        forceVertical
        description="
        Have a look at your secure software development lifecycle posture assessment and get an overview of the risks this specific asset poses to your organization."
        title="Overview"
      >
        <SDLC metrics={metrics} />
        <p className="mt-2 text-sm text-muted-foreground">
          This diagram displays the current state of your software development
          lifecycle. It shows which threats are mitigated already as well as
          which threats are still open. The threat model is heavily based on the
          proposed threat model by{" "}
          <Link href="https://slsa.dev/spec/v1.0/threats" target="_blank">
            <Image
              src="/assets/slsa.svg"
              alt="SLSA Logo"
              className="inline dark:hidden"
              width={60}
              height={20}
            />
            <Image
              src="/assets/slsa_dark.svg"
              alt="SLSA Logo"
              className="hidden dark:inline-block"
              width={60}
              height={20}
            />
          </Link>
          .
        </p>
        <div>
          <Card className="flex-1">
            <Collapsible>
              <CardHeader>
                <CardTitle className="-mb-3">
                  <CollapsibleControlTrigger
                    maxEvidence={15}
                    currentEvidence={metrics2CurrentEvidence(metrics)}
                  >
                    <div className="w-full text-left">
                      Threats and mitigations
                    </div>
                  </CollapsibleControlTrigger>
                </CardTitle>
                <CardDescription>
                  Details of your secure software development lifecycle
                </CardDescription>
              </CardHeader>

              <CollapsibleContent className="py-2">
                <CardContent>
                  <ThreatsMitigationsCollapsibles
                    metrics={metrics}
                    router={router}
                    asset={asset}
                  />
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
        <div className="mt-2 grid gap-4">
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
          <DependenciesPieChart data={dependencyCountByscanner} />
        </div> */}
        </div>
      </Section>
    </Page>
  );
};
export default Index;

const extractDateOnly = (date: Date) => date.toISOString().split("T")[0];

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext) => {
    const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
      context.params!;

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
      "/asset-version/" +
      assetVersionSlug +
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
      metrics,
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
      apiClient(
        "/organizations/" +
          organizationSlug +
          "/projects/" +
          projectSlug +
          "/assets/" +
          assetSlug +
          "/metrics",
      ).then((r) => r.json()),
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
        metrics,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    project: withProject,
    asset: withAsset,
    assetVersion: withAssetVersion,
    contentTree: withContentTree,
  },
);
