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
import Image from "next/image";
import { useRouter } from "next/router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../../../../components/ui/card";

import {
  CheckBadgeIcon,
  ExclamationCircleIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { Pie, PieChart } from "recharts";
import ComplianceGrid from "../../../../../../../../components/ComplianceGrid";
import SeverityCard from "../../../../../../../../components/SeverityCard";
import { Badge } from "../../../../../../../../components/ui/badge";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../../../../../../components/ui/chart";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../../../../../../components/ui/tooltip";
import { fetchAssetStats } from "../../../../../../../../services/statService";
import {
  PolicyEvaluation,
  RiskDistribution,
} from "../../../../../../../../types/api/api";
import { osiLicenseHexColors } from "../../../../../../../../utils/view";

interface Props {
  compliance: Array<PolicyEvaluation>;
  riskDistribution: RiskDistribution;
  cvssDistribution: RiskDistribution;
  licenses: Record<string, number>;
}

const Index: FunctionComponent<Props> = ({
  compliance,
  riskDistribution,
  cvssDistribution,
  licenses,
}) => {
  const activeOrg = useActiveOrg();
  const assetMenu = useAssetMenu();
  const project = useActiveProject();
  const asset = useActiveAsset()!;
  const { branches, tags } = useAssetBranchesAndTags();

  const router = useRouter();

  const chartConfig = useMemo(() => {
    return Object.entries(licenses).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: {
          label: key,
        },
      };
    }, {} satisfies ChartConfig);
  }, [licenses]);

  const chartData = useMemo(() => {
    return Object.entries(licenses)
      .map(([key, value]) => ({
        license: key,
        amount: value,
        fill: osiLicenseHexColors[key] ?? osiLicenseHexColors["unknown"],
      }))
      .sort((a, b) => {
        return b.amount - a.amount;
      });
  }, [licenses]);

  const controlsPassing = useMemo(
    () =>
      compliance.reduce((acc, policy) => {
        return acc + (policy.result ? 1 : 0);
      }, 0),
    [compliance],
  );

  const failingControls = useMemo(
    () => compliance.filter((policy) => policy.result === false),
    [compliance],
  );

  const totalDependencies = useMemo(
    () =>
      Object.values(licenses).reduce((acc, value) => {
        return acc + value;
      }, 0),
    [licenses],
  );

  return (
    <Page
      Menu={assetMenu}
      title="Overview"
      description="Overview of the asset"
      Title={<AssetTitle />}
    >
      <BranchTagSelector branches={branches} tags={tags} />
      <Section
        primaryHeadline
        forceVertical
        description="
        Have a look at your secure software development lifecycle posture assessment and get an overview of the risks this specific asset poses to your organization."
        title="Overview"
      >
        <div className="grid grid-cols-8 gap-4">
          <Card className="col-span-4 row-span-1">
            <CardHeader>
              <CardTitle>Security Posture</CardTitle>
              <CardDescription>
                The security posture of the asset is determined by the
                compliance of the asset with the security policies of the
                organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {failingControls.length > 0 ? (
                <div className="flex flex-row items-center gap-2">
                  <Badge variant={"danger"}>
                    <ExclamationCircleIcon className="-ml-2 h-8 w-8 text-red-500" />
                    <span className="pl-2 text-base">
                      {failingControls.length} controls are failing
                    </span>
                  </Badge>
                </div>
              ) : (
                <div className="flex flex-row items-center gap-2">
                  <Badge variant={"success"}>
                    <CheckBadgeIcon className="-ml-2 h-8 w-8 text-green-500" />
                    <span className="pl-2 text-base">
                      All controls are passing
                    </span>
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="col-span-4 row-span-2">
            <CardHeader>
              <CardTitle>To-Do&apos;s</CardTitle>
              <CardDescription>
                Tasks that need to be completed before the asset is ready for
                production, ordered by priority.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {failingControls.length > 0 ? (
                <div className="flex flex-col">
                  {failingControls.slice(0, 3).map((policy, i, arr) => (
                    <div
                      className={
                        i === 0
                          ? "border-b pb-4"
                          : i === arr.length - 1
                            ? "pt-4"
                            : "border-b py-4"
                      }
                      key={policy.title}
                    >
                      <div className="mb-2 flex flex-row items-center gap-2 text-sm font-semibold">
                        {policy.title}
                        <div className="flex flex-row flex-wrap gap-2">
                          {policy.complianceFrameworks.map((t) => (
                            <Badge key={t} variant={"secondary"}>
                              <Image
                                className="mr-1 inline-block"
                                src="/assets/iso.svg"
                                width={15}
                                height={15}
                                alt="Compliance"
                              />{" "}
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {policy.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-row items-center gap-2">
                  <Badge variant={"success"}>
                    <CheckBadgeIcon className="-ml-2 h-8 w-8 text-green-500" />
                    <span className="pl-2 text-base">No tasks until ready</span>
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="col-span-4 row-span-1">
            <CardHeader className="">
              <CardTitle className="relative flex flex-row items-end gap-2">
                <ScaleIcon className="h-6 w-6 text-muted-foreground" />
                <div className="flex flex-row items-center gap-2">
                  Compliance Controls
                  <Tooltip>
                    <TooltipTrigger>
                      <InformationCircleIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <Link
                        className="text-sm !text-muted-foreground"
                        href={
                          "https://github.com/l3montree-dev/attestation-compliance-policies"
                        }
                      >
                        Based on a community driven mapping between technical
                        checks and compliance controls
                      </Link>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Link
                  href={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/settings#compliance`}
                  className="absolute right-0 top-0 text-xs !text-muted-foreground"
                >
                  Modify Policies
                </Link>
              </CardTitle>
              <CardDescription>
                Displays the compliance of the asset with the security policies
                of the asset.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComplianceGrid compliance={compliance} />
            </CardContent>
          </Card>
          <SeverityCard
            variant="critical"
            queryIntervalStart={8}
            amountByRisk={riskDistribution.critical}
            amountByCVSS={cvssDistribution.critical}
          />
          <SeverityCard
            variant="high"
            queryIntervalStart={7}
            amountByRisk={riskDistribution.high}
            amountByCVSS={cvssDistribution.high}
          />
          <Card className="col-span-4 row-span-2 flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle className="relative w-full text-center">
                Licenses
                <Link
                  href={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/refs/${router.query.assetVersionSlug}/dependencies`}
                  className="absolute right-0 top-0 text-xs !text-muted-foreground"
                >
                  See all
                </Link>
              </CardTitle>
              <CardDescription>
                Displays the distribution of dependency licenses
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-row justify-center pb-0">
              <div className="flex flex-row items-center">
                <ChartContainer
                  config={chartConfig}
                  className="aspect-square max-h-[250px] w-[250px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Pie
                      data={chartData}
                      dataKey="amount"
                      nameKey="license"
                      innerRadius={60}
                      strokeWidth={5}
                    />
                  </PieChart>
                </ChartContainer>
                <div>
                  {chartData.map((entry, index) => (
                    <div
                      key={`cell-${index}`}
                      className="flex flex-row items-center gap-2"
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: entry.fill,
                        }}
                      ></div>
                      <span className="text-sm capitalize text-muted-foreground">
                        {entry.license}{" "}
                        {((entry.amount / totalDependencies) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <SeverityCard
            variant="medium"
            queryIntervalStart={4}
            amountByRisk={riskDistribution.medium}
            amountByCVSS={cvssDistribution.medium}
          />
          <SeverityCard
            variant="low"
            queryIntervalStart={0}
            amountByRisk={riskDistribution.low}
            amountByCVSS={cvssDistribution.low}
          />
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

    const { compliance, riskDistribution, cvssDistribution, licenses } =
      await fetchAssetStats({
        organizationSlug: organizationSlug as string,
        projectSlug: projectSlug as string,
        assetSlug: assetSlug as string,
        assetVersionSlug: assetVersionSlug as string,
        apiClient,
      });
    return {
      props: {
        compliance,
        riskDistribution,
        cvssDistribution,
        licenses,
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
