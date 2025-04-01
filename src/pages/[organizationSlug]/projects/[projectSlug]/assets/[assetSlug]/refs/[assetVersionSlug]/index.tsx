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
import Image from "next/image";
import { classNames } from "../../../../../../../../utils/common";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../../../../../../components/ui/tooltip";

import {
  CrossIcon,
  InfoIcon,
  ShieldCheckIcon,
  ShieldCloseIcon,
} from "lucide-react";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { Badge } from "../../../../../../../../components/ui/badge";

interface PolicyEvaluation {
  result: boolean | null;
  title: string;
  description: string;
  tags: Array<string>;
  relatedResources: Array<string>;
  complianceFrameworks: Array<string>;
}
interface Props {
  compliance: Record<string, Array<PolicyEvaluation>>;
  riskDistribution: Record<string, number>;
  cvssDistribution: Record<string, number>;
}

const selectedCompliance = "iso27001";

const fakePolicyGenerator = (count: number) => {
  const policies = [];
  for (let i = 0; i < count; i++) {
    policies.push({
      result: null,
      title: `Policy ${i}`,
      description: `Description ${i}`,
      tags: ["tag1", "tag2"],
      relatedResources: ["resource1", "resource2"],
      complianceFrameworks: ["iso27001"],
    });
  }
  return policies;
};

const Index: FunctionComponent<Props> = ({
  compliance,
  riskDistribution,
  cvssDistribution,
}) => {
  const activeOrg = useActiveOrg();
  const assetMenu = useAssetMenu();
  const project = useActiveProject();
  const asset = useActiveAsset()!;
  const { branches, tags } = useAssetBranchesAndTags();

  const router = useRouter();

  const controlsPassing = useMemo(
    () =>
      compliance[selectedCompliance].reduce((acc, policy) => {
        return acc + (policy.result ? 1 : 0);
      }, 0),
    [compliance],
  );

  const amountOfFailingControls = useMemo(
    () =>
      compliance[selectedCompliance].reduce((acc, policy) => {
        return acc + (policy.result === false ? 1 : 0);
      }, 0),
    [compliance],
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
              {amountOfFailingControls > 0 ? (
                <div className="flex flex-row items-center gap-2">
                  <Badge variant={"danger"}>
                    <ShieldCloseIcon className="-ml-2 h-8 w-8 text-red-500" />
                    <span className="pl-2 text-base">
                      {amountOfFailingControls} controls are failing
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
              <CardTitle>Tasks until ready</CardTitle>
              <CardDescription>
                Tasks that need to be completed before the asset is ready for
                production. Before it meets all compliance requirements.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="col-span-4 row-span-1">
            <div className="flex w-full flex-row items-start gap-2 p-6">
              <Image
                className="mr-2 inline-block"
                src="/assets/iso.svg"
                width={35}
                height={35}
                alt="Compliance"
              />
              <div className="flex-1">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="relative flex flex-row justify-between">
                    ISO 27001
                  </CardTitle>
                  <CardDescription>
                    ISO/IEC 27001 is an international standard on how to manage
                    information security. It details requirements for
                    establishing, implementing, maintaining, and continually
                    improving an information security management system (ISMS).
                    <br />
                    Based on a community driven mapping between technical checks
                    and compliance controls
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <div className="grid-cols-25 grid gap-1">
                    {compliance[selectedCompliance].map((policy) => (
                      <div
                        className={classNames(
                          "aspect-square rounded-sm",
                          Boolean(policy.result)
                            ? " bg-green-500 shadow-green-400 drop-shadow"
                            : "border border-gray-500/30 bg-gray-500/20",
                        )}
                        key={policy.title}
                      ></div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <span className="text-sm">
                      {controlsPassing}{" "}
                      <span className="text-muted-foreground">
                        / {compliance[selectedCompliance].length} Controls are
                        passing (
                        {(
                          (controlsPassing /
                            compliance[selectedCompliance].length) *
                          100
                        ).toFixed(1)}{" "}
                        %)
                      </span>
                    </span>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Critical Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div
                  className={classNames(
                    "flex flex-col",
                    riskDistribution["critical"]
                      ? "text-red-700"
                      : "text-muted-foreground",
                  )}
                >
                  <span className={classNames("text-4xl font-bold")}>
                    {riskDistribution["critical"] ?? 0}
                  </span>
                </div>

                <div className={classNames("text-xs text-muted-foreground")}>
                  <span>By CVSS you would have</span>
                  <span className={classNames("inline px-1 font-bold")}>
                    {cvssDistribution["critical"] ?? 0}
                  </span>
                  critical severity vulnerabilities
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>High Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div
                  className={classNames(
                    "flex flex-col",
                    riskDistribution["high"]
                      ? "text-red-500"
                      : "text-muted-foreground",
                  )}
                >
                  <span className={classNames("text-4xl font-bold")}>
                    {riskDistribution["high"] ?? 0}
                  </span>
                </div>

                <div className={classNames("text-xs text-muted-foreground")}>
                  <span>By CVSS you would have</span>
                  <span className={classNames("inline px-1 font-bold")}>
                    {cvssDistribution["high"] ?? 0}
                  </span>
                  high severity vulnerabilities
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Medium Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div
                  className={classNames(
                    "flex flex-col",
                    riskDistribution["medium"]
                      ? "text-orange-500"
                      : "text-muted-foreground",
                  )}
                >
                  <span className={classNames("text-4xl font-bold")}>
                    {riskDistribution["medium"] ?? 0}
                  </span>
                </div>

                <div className={classNames("text-xs text-muted-foreground")}>
                  <span>By CVSS you would have</span>
                  <span className={classNames("inline px-1 font-bold")}>
                    {cvssDistribution["medium"] ?? 0}
                  </span>
                  medium severity vulnerabilities
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Low Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div
                  className={classNames(
                    "flex flex-col",
                    riskDistribution["low"]
                      ? "text-yellow-500"
                      : "text-muted-foreground",
                  )}
                >
                  <span className={classNames("text-4xl font-bold")}>
                    {riskDistribution["low"] ?? 0}
                  </span>
                </div>

                <div className={classNames("text-xs text-muted-foreground")}>
                  <span>By CVSS you would have</span>
                  <span className={classNames("inline px-1 font-bold")}>
                    {cvssDistribution["low"] ?? 0}
                  </span>
                  low severity vulnerabilities
                </div>
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

    const url =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/refs/" +
      assetVersionSlug +
      "/";
    const [compliance, riskDistribution, cvssDistribution] = await Promise.all([
      apiClient(url + "compliance").then((r) => r.json()),
      apiClient(url + "stats/risk-distribution").then((r) => r.json()),
      apiClient(url + "stats/cvss-distribution").then((r) => r.json()),
    ]);

    // group by compliance framework
    const complianceByFramework: Record<string, Array<PolicyEvaluation>> = {};
    compliance
      .concat(fakePolicyGenerator(90))
      .forEach((policy: PolicyEvaluation) => {
        policy.complianceFrameworks.forEach((framework) => {
          if (!complianceByFramework[framework]) {
            complianceByFramework[framework] = [];
          }
          complianceByFramework[framework].push(policy);
        });
      });

    return {
      props: {
        compliance: complianceByFramework,
        riskDistribution,
        cvssDistribution,
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
