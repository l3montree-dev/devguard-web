import Page from "@/components/Page";
import { TotalDependencies } from "@/components/overview/TotalDependenciesDiagram";
import { CriticalDependencies } from "@/components/overview/CriticalDependenciesDiagram";
import { RiskDistribution } from "@/components/overview/RiskDistributionDiagram";
import { RiskTrend } from "@/components/overview/RiskTrendDiagram";

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
  AssetFlaws,
  AssetOverviewDTO,
  AssetRiskDistribution,
  AssetRisks,
  TransformedAssetRisk,
} from "@/types/api/api";
import { uniq } from "lodash";
import { LineChart } from "lucide-react";
import { GetServerSidePropsContext } from "next";

import Link from "next/link";
import { FunctionComponent } from "react";
import { FlawsDiagram } from "@/components/overview/FlawsDiagram";
import { ActivityLogElement } from "@/components/ActivityLog";
import { DamagedPackage } from "@/components/overview/DamagedPackageDiagram";
import AssetFlawsStateStatistics from "@/components/overview/AssetFlawsStateStatistics";

interface Props {
  data: AssetOverviewDTO;
}

const Index: FunctionComponent<Props> = ({ data }) => {
  const activeOrg = useActiveOrg();
  const assetMenu = useAssetMenu();
  const project = useActiveProject();
  const asset = useActiveAsset()!;

  return (
    <Page
      Menu={assetMenu}
      title="Overview"
      description="Overview of the asset"
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
            href={`/${activeOrg.slug}/projects/${project?.slug}`}
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
            href={`/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}`}
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
      <AssetFlawsStateStatistics data={data} />

      <DamagedPackage data={data} />

      <div className="flex gap-2">
        <div className="h-full flex-1">
          <TotalDependencies data={data} />
        </div>
        <div className="h-full flex-1">
          <CriticalDependencies data={data} />
        </div>
        <div className="h-full flex-1">
          <RiskDistribution data={data.assetRiskDistribution} />
        </div>
      </div>

      <div>
        <FlawsDiagram data={data.assetFlaws} />
      </div>

      <div>
        <RiskTrend data={data.assetRisks} />
      </div>

      {data.flawEvents.map((event, index) => (
        <ActivityLogElement
          key={event.id}
          event={event}
          index={index}
          flawName={event.flawName || ""}
        />
      ))}

      <div></div>
    </Page>
  );
};
export default Index;

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext) => {
    const { organizationSlug, projectSlug, assetSlug } = context.params!;

    const apiClient = getApiClientFromContext(context);
    const resp = await apiClient(
      "/organizations/" +
        organizationSlug +
        "/projects/" +
        projectSlug +
        "/assets/" +
        assetSlug +
        "/" +
        "overview",
    );
    if (!resp.ok) {
      console.log("can't find asset");
      return {
        notFound: true,
      };
    }

    const data = await resp.json();

    //console.log(data);
    //console.log("hhh", data.flawEvents);

    data.assetRiskDistribution = transformAssetRiskDistribution(
      data.assetRiskDistribution,
    );
    data.assetRisks = sortDate(data.assetRisks);
    data.assetFlaws = sortAssetFlawsCenterHigh(data.assetFlaws);

    return {
      props: {
        data,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    project: withProject,
    asset: withAsset,
  },
);

function transformAssetRiskDistribution(
  assetRiskDistribution: AssetRiskDistribution[],
): TransformedAssetRisk[] {
  const riskRanges = ["0-2", "2-4", "4-6", "6-8", "8-10"];

  if (!Array.isArray(assetRiskDistribution)) {
    throw new Error("assetRiskDistribution muss ein Array sein.");
  }
  const scannerIds = Array.from(
    new Set(assetRiskDistribution.map((risk) => risk.scannerId)),
  );

  return riskRanges.map((range) => {
    const risks = assetRiskDistribution.filter(
      (risk) => risk.riskRange === range,
    );
    const res: TransformedAssetRisk = {
      riskRange: range,
    };

    risks.forEach((risk) => {
      res[risk.scannerId] = risk.count;
    });
    // check if all scanners are present
    scannerIds.forEach((scannerId) => {
      if (!res[scannerId]) {
        res[scannerId] = 0;
      }
    });

    return res;
  });
}

// sort Asset Risks by date
function sortDate(data: AssetRisks[]): AssetRisks[] {
  return data.sort(
    (a, b) => new Date(a.dayOfScan).getTime() - new Date(b.dayOfScan).getTime(),
  );
}

// sort Asset Flaws by rawRiskAssessment
function sortAssetFlawsCenterHigh(arr: AssetFlaws[]): AssetFlaws[] {
  arr.sort((a, b) => b.rawRiskAssessment - a.rawRiskAssessment);

  let result: AssetFlaws[] = [];

  let n = arr.length - 1;
  let z = arr.length - 1;
  let i = 0;

  while (z > 0) {
    result[i++] = arr[z--];
    result[n - i] = arr[z--];
  }
  return result;
}
