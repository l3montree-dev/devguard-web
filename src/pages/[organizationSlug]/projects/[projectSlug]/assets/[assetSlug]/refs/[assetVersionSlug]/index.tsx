import Page from "@/components/Page";

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
import "@xyflow/react/dist/style.css";
import { GetServerSidePropsContext } from "next";

import { FunctionComponent, useMemo } from "react";

import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import Section from "@/components/common/Section";
import { withAssetVersion } from "@/decorators/withAssetVersion";
import { withContentTree } from "@/decorators/withContentTree";
import { useAssetBranchesAndTags } from "@/hooks/useActiveAssetVersion";
import { useRouter } from "next/router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../../../../components/ui/card";

import AverageFixingTimeChart from "@/components/AverageFixingTimeChart";
import { RiskHistoryChart } from "@/components/RiskHistoryDiagram";
import { VulnerableComponents } from "@/components/VulnerableComponents";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import SeverityCard from "../../../../../../../../components/SeverityCard";
import { Badge } from "../../../../../../../../components/ui/badge";
import VulnEventItem from "../../../../../../../../components/VulnEventItem";
import { fetchAssetStats } from "../../../../../../../../services/statService";
import {
  AverageFixingTime,
  ComponentRisk,
  LicenseResponse,
  Paged,
  PolicyEvaluation,
  RiskDistribution,
  RiskHistory,
  VulnEventDTO,
} from "../../../../../../../../types/api/api";

interface Props {
  compliance: Array<PolicyEvaluation>;
  componentRisk: ComponentRisk;
  riskHistory: RiskHistory[];
  riskDistribution: RiskDistribution;
  cvssDistribution: RiskDistribution;
  avgLowFixingTime: AverageFixingTime;
  avgMediumFixingTime: AverageFixingTime;
  avgHighFixingTime: AverageFixingTime;
  avgCriticalFixingTime: AverageFixingTime;
  licenses: Array<LicenseResponse>;
  events: Paged<VulnEventDTO>;
}

const Index: FunctionComponent<Props> = ({
  componentRisk,
  riskHistory,
  riskDistribution,
  cvssDistribution,
  avgLowFixingTime,
  avgMediumFixingTime,
  avgHighFixingTime,
  avgCriticalFixingTime,
  licenses,
  events,
}) => {
  const activeOrg = useActiveOrg();
  const assetMenu = useAssetMenu();
  const project = useActiveProject();
  const asset = useActiveAsset()!;

  const { branches, tags } = useAssetBranchesAndTags();

  const router = useRouter();

  return (
    <Page
      Menu={assetMenu}
      title="Overview"
      description="Overview of the repository"
      Title={<AssetTitle />}
    >
      <BranchTagSelector branches={branches} tags={tags} />
      <Section
        primaryHeadline
        forceVertical
        description="Have a look at the overall health of your repository."
        title="Overview"
      >
        <div className="grid grid-cols-4 gap-4">
          <SeverityCard
            variant="critical"
            queryIntervalStart={8}
            queryIntervalEnd={10}
            amountByRisk={riskDistribution.critical}
            amountByCVSS={cvssDistribution.critical}
          />
          <SeverityCard
            variant="high"
            queryIntervalStart={7}
            queryIntervalEnd={8}
            amountByRisk={riskDistribution.high}
            amountByCVSS={cvssDistribution.high}
          />
          <SeverityCard
            variant="medium"
            queryIntervalStart={4}
            queryIntervalEnd={7}
            amountByRisk={riskDistribution.medium}
            amountByCVSS={cvssDistribution.medium}
          />
          <SeverityCard
            variant="low"
            queryIntervalStart={0}
            queryIntervalEnd={3}
            amountByRisk={riskDistribution.low}
            amountByCVSS={cvssDistribution.low}
          />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <VulnerableComponents data={componentRisk} />
          <div className="col-span-2 flex flex-col">
            <Card>
              <CardHeader>
                <CardTitle className="relative w-full">
                  Licenses
                  <Link
                    href={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/refs/${router.query.assetVersionSlug}/dependencies`}
                    className="absolute right-0 top-0 text-xs !text-muted-foreground"
                  >
                    See all
                  </Link>
                </CardTitle>
                <CardDescription className="text-left">
                  Displays the distribution of dependency licenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex  flex-col">
                  {licenses.slice(0, 5).map((el, i, arr) => (
                    <div
                      className={
                        i === 0
                          ? "border-b pb-4"
                          : i === arr.length - 1
                            ? "pt-4"
                            : "border-b py-4"
                      }
                      key={el.license.licenseId}
                    >
                      <div className="mb-1 flex flex-row items-center gap-2 text-sm font-semibold">
                        <span className="capitalize">
                          {el.license.licenseId}
                        </span>
                        <div className="flex flex-row flex-wrap gap-2">
                          {el.license.isOsiApproved && (
                            <Badge variant={"secondary"}>
                              <CheckBadgeIcon className="-ml-1.5 mr-1 inline-block h-4 w-4 text-green-500" />
                              OSI Approved
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {el.license.name
                          ? el.license.name
                          : "Unknown license information"}
                        , {el.count} dependencies
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <RiskHistoryChart
          data={[{ label: asset.name, history: riskHistory }]}
        />
        <div className="grid grid-cols-8 gap-4">
          <div className="col-span-4 grid grid-cols-2 gap-4">
            <AverageFixingTimeChart
              variant="critical"
              title="Avg. remediation time"
              description="Time for critical severity vulnerabilities"
              avgFixingTime={avgCriticalFixingTime}
            />

            <AverageFixingTimeChart
              variant="high"
              title="Avg. remediation time"
              description="Time for high severity vulnerabilities"
              avgFixingTime={avgHighFixingTime}
            />

            <AverageFixingTimeChart
              variant="medium"
              title="Avg. remediation time"
              description="Time for medium severity vulnerabilities"
              avgFixingTime={avgMediumFixingTime}
            />

            <AverageFixingTimeChart
              variant="low"
              title="Avg. remediation time"
              description="Time for low severity vulnerabilities"
              avgFixingTime={avgLowFixingTime}
            />
          </div>
          <Card className="col-span-4 flex flex-col">
            <CardHeader>
              <CardTitle className="relative w-full">
                Activity Stream
                <Link
                  href={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/refs/${router.query.assetVersionSlug}/events`}
                  className="absolute right-0 top-0 text-xs !text-muted-foreground"
                >
                  See all
                </Link>
              </CardTitle>
              <CardDescription>
                Displays the last events that happened on the repository.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <ul
                  className="relative flex flex-col gap-10 pb-10 text-foreground"
                  role="list"
                >
                  <div className="absolute left-3 h-full border-l border-r bg-secondary" />
                  {events.data.map((event, index, events) => {
                    return (
                      <VulnEventItem
                        key={event.id}
                        event={event}
                        index={index}
                        events={events}
                      />
                    );
                  })}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </Page>
  );
};
export default Index;

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext) => {
    const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
      context.params!;

    const apiClient = getApiClientFromContext(context);

    const {
      compliance,
      componentRisk,
      riskHistory,
      riskDistribution,
      cvssDistribution,
      avgLowFixingTime,
      avgMediumFixingTime,
      avgHighFixingTime,
      avgCriticalFixingTime,
      licenses,
      events,
    } = await fetchAssetStats({
      organizationSlug: organizationSlug as string,
      projectSlug: projectSlug as string,
      assetSlug: assetSlug as string,
      assetVersionSlug: assetVersionSlug as string,
      apiClient,
      context,
    });

    return {
      props: {
        compliance,
        componentRisk,
        riskHistory,
        riskDistribution,
        cvssDistribution,
        avgLowFixingTime,
        avgMediumFixingTime,
        avgHighFixingTime,
        avgCriticalFixingTime,
        licenses,
        events,
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
