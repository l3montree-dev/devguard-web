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

import {
  CheckBadgeIcon,
  ExclamationCircleIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import ComplianceGrid from "../../../../../../../../components/ComplianceGrid";
import SeverityCard from "../../../../../../../../components/SeverityCard";
import { Badge } from "../../../../../../../../components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../../../../../../components/ui/tooltip";
import VulnEventItem from "../../../../../../../../components/VulnEventItem";
import { fetchAssetStats } from "../../../../../../../../services/statService";
import {
  LicenseResponse,
  Paged,
  PolicyEvaluation,
  RiskDistribution,
  VulnEventDTO,
} from "../../../../../../../../types/api/api";
import ColoredBadge from "../../../../../../../../components/common/ColoredBadge";
import { TriangleAlert } from "lucide-react";
import { violationLengthToLevel } from "../../../../../../../../utils/view";

interface Props {
  compliance: Array<PolicyEvaluation>;
  riskDistribution: RiskDistribution;
  cvssDistribution: RiskDistribution;
  licenses: Array<LicenseResponse>;
  events: Paged<VulnEventDTO>;
}

const Index: FunctionComponent<Props> = ({
  compliance,
  riskDistribution,
  cvssDistribution,
  licenses,
  events,
}) => {
  const activeOrg = useActiveOrg();
  const assetMenu = useAssetMenu();
  const project = useActiveProject();
  const asset = useActiveAsset()!;

  const { branches, tags } = useAssetBranchesAndTags();

  const router = useRouter();

  const failingControls = useMemo(
    () => compliance.filter((policy) => policy.compliant !== true),
    [compliance],
  );

  const totalDependencies = useMemo(
    () => licenses.reduce((acc, license) => acc + license.count, 0),
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
                      key={policy.id}
                    >
                      <Link
                        className="!text-foreground"
                        href={router.asPath + "/compliance/" + policy.id}
                      >
                        <div className="mb-2 flex flex-row items-center gap-2 text-sm font-semibold">
                          {policy.title}
                          {policy.compliant === null ? (
                            <ColoredBadge variant="high">
                              <TriangleAlert className="h-4 w-4 mr-1" />
                              Could not evaluate control
                            </ColoredBadge>
                          ) : (
                            <ColoredBadge
                              variant={violationLengthToLevel(
                                policy.violations?.length ?? 0,
                              )}
                            >
                              {policy.violations?.length ?? 0} Violations
                            </ColoredBadge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {policy.description}
                        </p>
                      </Link>
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
                  href={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/refs/${router.query.assetVersionSlug}/compliance`}
                  className="absolute right-0 top-0 text-xs !text-muted-foreground"
                >
                  Overview
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
          <div className="col-span-4 grid grid-cols-2 gap-4">
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
          <div className="col-span-4 row-span-2 flex flex-col">
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
                  {licenses.map((el, i, arr) => (
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
          <Card className="col-span-4 row-span-1 flex flex-col bg-transparent">
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
                Displays the last events that happened on the asset.
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

    const { compliance, riskDistribution, cvssDistribution, licenses, events } =
      await fetchAssetStats({
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
        riskDistribution,
        cvssDistribution,
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
