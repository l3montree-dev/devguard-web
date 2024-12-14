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
  AssetDTO,
  AverageFixingTime,
  ComponentRisk,
  DependencyCountByScanType,
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
import CustomTab from "@/components/common/CustomTab";
import EmptyOverview from "@/components/common/EmptyOverview";
import SDLC from "@/components/common/SDLC";
import Section from "@/components/common/Section";
import AverageFixingTimeChart from "@/components/overview/AverageFixingTimeChart";
import { Button } from "@/components/ui/button";
import { Collapsible } from "@/components/ui/collapsible";
import { withContentTree } from "@/decorators/withContentTree";
import { Tab } from "@headlessui/react";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import Image from "next/image";
import Link from "next/link";
import { NextRouter, useRouter } from "next/router";

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

const producerThreats = (router: NextRouter, asset: AssetDTO) => [
  {
    threat: "Write insecure code",
    maxEvidence: 2,
    currentEvidence: Number(Boolean(asset.lastSastScan)),
    Message: (
      <>
        <p className="mb-2">
          <strong>Example</strong>: A developer writes code that is vulnerable
          to SQL injection
        </p>
        <p className="mt-2">
          Producing insecure code is unavoidable. Mistakes do happen and
          security issues will always be introduced into the codebase. The goal
          is to minimize the amount of insecure code that is produced. This can
          be achieved by following secure coding guidelines. Some issues can be
          found using Static Code Analysis Tools. Automatic tools do find{" "}
          <strong>up to around 50%</strong> of the issues. Always remember that
          the best tool is a human. Sometimes a dedicated secure code review is
          required.
        </p>
        <div className="mt-4 flex flex-row gap-2">
          <Link
            href={
              router.asPath +
              "/security-control-center?highlight=secure-coding-guidelines"
            }
          >
            <Button size={"sm"} variant={"secondary"}>
              Download Secure-Coding Guidelines and distribute inside your team
            </Button>
          </Link>
          <Link
            href={router.asPath + "/security-control-center?highlight=sast"}
          >
            <Button size={"sm"} variant={"secondary"}>
              Enable Static Code Analysis to find vulnerabilities in your code
            </Button>
          </Link>
        </div>
      </>
    ),
  },
  {
    threat: "Submit Unauthorized Change",
    maxEvidence: 1,
    currentEvidence: 0,
    Message: (
      <>
        <p>
          <strong>Example</strong>: Submit a change with stolen GitLab
          Credentials through the web interface or API
        </p>
        <p className="mt-2">
          Commits can be signed using the devguard command line interface and a
          private key. Actually, based on in toto principles, all of the file
          hashes are recorded. DevGuard is verifying the signatures inside the
          continuous integration pipeline and inside the deployment
          infrastructure. It matches those with keys created and managed by
          devguard.
        </p>
        <p className="mt-2">
          Use the In-Toto Provenance to mitigate this and other threats.
        </p>
        <div className="mt-4">
          <Link
            href={
              router.asPath +
              "/security-control-center?highlight=in-toto-provenance"
            }
          >
            <Button size={"sm"} variant={"secondary"}>
              Enable In-Toto Provenance
            </Button>
          </Link>
        </div>
      </>
    ),
  },
  {
    threat: "Insider Threat",
    maxEvidence: 0,
    currentEvidence: 0,
    Message: (
      <>
        <p>
          <strong>Example</strong>: A developer with access to the repository
          submits a change that introduces a backdoor
        </p>
        <p className="mt-2">
          DevGuard is not able to detect insider threats. Nevertheless, it
          courages Code-Reviews and the usage of the In-Toto Provenance to make
          changes traceable.
        </p>
      </>
    ),
  },
];

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
        Title={<AssetTitle />}
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

  const producerThreatsArr = producerThreats(router, asset);

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
        <Tab.Group>
          <Tab.List>
            <CustomTab>
              Secure software development lifecycle posture assessment
            </CustomTab>
            <CustomTab>Risks</CustomTab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <SDLC />
              <p className="mt-2 text-sm text-muted-foreground">
                This diagram displays the current state of your software
                development lifecycle. It shows which threats are mitigated
                already as well as which threats are still open. The threat
                model is heavily based on the proposed threat model by{" "}
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
              <Section forceVertical title="Threats and mitigations">
                <Collapsible>
                  <CollapsibleControlTrigger
                    maxEvidence={producerThreatsArr.reduce(
                      (acc, curr) => acc + curr.maxEvidence,
                      0,
                    )}
                    currentEvidence={producerThreatsArr.reduce(
                      (acc, curr) => acc + curr.currentEvidence,
                      0,
                    )}
                  >
                    <div className="w-full text-left">(A) Producer Threats</div>
                  </CollapsibleControlTrigger>
                  <div className="border-b">
                    <CollapsibleContent className="py-2">
                      <p className="text-sm text-muted-foreground">
                        Producer threats are threats that originate from the
                        developers working on the software. Such threats might
                        be intentional or unintentional. They can be further
                        devided into the following categories:
                      </p>
                      <div className="mt-4 flex flex-col gap-2 text-sm">
                        {producerThreatsArr.map((threat, i) => (
                          <Collapsible
                            className="rounded-lg border px-2 py-0"
                            key={threat.threat}
                          >
                            <CollapsibleControlTrigger
                              maxEvidence={threat.maxEvidence}
                              currentEvidence={threat.currentEvidence}
                            >
                              <div className="w-full text-left">
                                {threat.threat}
                              </div>
                            </CollapsibleControlTrigger>
                            <CollapsibleContent className="py-2">
                              <div className="text-sm text-muted-foreground">
                                {threat.Message}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
                <Collapsible>
                  <CollapsibleControlTrigger
                    maxEvidence={1}
                    currentEvidence={0}
                  >
                    <div className="w-full text-left">
                      (B) Compromise during source code upload
                    </div>
                  </CollapsibleControlTrigger>
                  <div className="border-b text-sm text-muted-foreground">
                    <CollapsibleContent className="py-2">
                      <p>
                        <strong>Example</strong>: An attacker who has gained
                        access to the software developers network can manipulate
                        the source code during the upload process by conducting
                        a man-in-the-middle (MITM) attack.
                      </p>
                      <p className="mt-2">
                        To mitigate this risk, Git supports secure upload
                        methods using SSH or HTTPS. Additionally, the upload
                        process can be further protected by leveraging In-Toto
                        file hash recording, ensuring the integrity and
                        authenticity of the source code.
                      </p>

                      <div className="mt-4">
                        <Link
                          href={
                            router.asPath +
                            "/security-control-center?highlight=in-toto-provenance"
                          }
                        >
                          <Button size={"sm"} variant={"secondary"}>
                            Enable In-Toto Provenance
                          </Button>
                        </Link>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
                <Collapsible>
                  <CollapsibleControlTrigger
                    maxEvidence={1}
                    currentEvidence={0}
                  >
                    <div className="w-full text-left">
                      (C) Compromise source repository
                    </div>
                  </CollapsibleControlTrigger>
                  <div className="border-b text-sm text-muted-foreground">
                    <CollapsibleContent className="py-2">
                      <p>
                        <strong>Example</strong>: An adversary introduces a
                        change to the source control repository, like GitLab,
                        through an administrative interface, or through a
                        compromise of the underlying infrastructure.
                      </p>
                      <p className="mt-2"></p>
                      <div className="mt-4">
                        <Link
                          href={
                            router.asPath +
                            "/security-control-center?highlight=in-toto-provenance"
                          }
                        >
                          <Button size={"sm"} variant={"secondary"}>
                            Enable In-Toto Provenance
                          </Button>
                        </Link>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
                <Collapsible>
                  <CollapsibleControlTrigger
                    maxEvidence={1}
                    currentEvidence={0}
                  >
                    <div className="w-full text-left">
                      (D) Build from modified source code
                    </div>
                  </CollapsibleControlTrigger>
                  <div className="border-b text-sm text-muted-foreground">
                    <CollapsibleContent className="py-2">
                      <p>
                        <strong>Example</strong>: An attacker is able to
                        compromise GitHub Actions and is able to modify the
                        source code before the build process starts.
                      </p>
                      <p className="mt-2">
                        DevGuard uses In-Toto to verify the integrity of the
                        build process. In-Toto records the file hashes of the
                        materials, like source code, and the produced artifacts.
                        DevGuard verifies, that the input of the build equals
                        the output of commit. Thus it is able to detect if the
                        source code was modified before the build process.
                      </p>
                      <div className="mt-4">
                        <Link
                          href={
                            router.asPath +
                            "/security-control-center?highlight=in-toto-provenance"
                          }
                        >
                          <Button size={"sm"} variant={"secondary"}>
                            Enable In-Toto Provenance
                          </Button>
                        </Link>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
                <Collapsible>
                  <CollapsibleControlTrigger
                    maxEvidence={1}
                    currentEvidence={0}
                  >
                    <div className="w-full text-left">
                      (E) Use compromised dependency
                    </div>
                  </CollapsibleControlTrigger>
                  <div className="border-b text-sm text-muted-foreground">
                    <CollapsibleContent className="py-2"></CollapsibleContent>
                  </div>
                </Collapsible>
                <Collapsible>
                  <CollapsibleControlTrigger
                    maxEvidence={1}
                    currentEvidence={0}
                  >
                    <div className="w-full text-left">
                      (F) Compromise build process
                    </div>
                  </CollapsibleControlTrigger>
                  <div className="border-b text-sm text-muted-foreground">
                    <CollapsibleContent className="py-2"></CollapsibleContent>
                  </div>
                </Collapsible>
                <Collapsible>
                  <CollapsibleControlTrigger
                    maxEvidence={1}
                    currentEvidence={0}
                  >
                    <div className="w-full text-left">
                      (G) Upload modified package
                    </div>
                  </CollapsibleControlTrigger>
                  <div className="border-b text-sm text-muted-foreground">
                    <CollapsibleContent className="py-2"></CollapsibleContent>
                  </div>
                </Collapsible>
                <Collapsible>
                  <CollapsibleControlTrigger
                    maxEvidence={1}
                    currentEvidence={0}
                  >
                    <div className="w-full text-left">
                      (H) Compromise package registry
                    </div>
                  </CollapsibleControlTrigger>
                  <div className="border-b text-sm text-muted-foreground">
                    <CollapsibleContent className="py-2"></CollapsibleContent>
                  </div>
                </Collapsible>
                <Collapsible>
                  <CollapsibleControlTrigger
                    maxEvidence={1}
                    currentEvidence={0}
                  >
                    <div className="w-full text-left">
                      (I) Use compromised package
                    </div>
                  </CollapsibleControlTrigger>
                  <div className="border-b text-sm text-muted-foreground">
                    <CollapsibleContent className="py-2"></CollapsibleContent>
                  </div>
                </Collapsible>
                <Collapsible>
                  <CollapsibleControlTrigger
                    maxEvidence={1}
                    currentEvidence={0}
                  >
                    <div className="w-full text-left">
                      (J) Deploy compromised or noncompliant software
                    </div>
                  </CollapsibleControlTrigger>
                  <div className="border-b text-sm text-muted-foreground">
                    <CollapsibleContent className="py-2"></CollapsibleContent>
                  </div>
                </Collapsible>
              </Section>
            </Tab.Panel>
            <Tab.Panel>
              <div className="mt-4 grid gap-4">
                <FlawAggregationState
                  title="Asset Risk"
                  description="The total risk this asset poses to the organization"
                  totalRisk={
                    riskHistory[riskHistory.length - 1]?.sumOpenRisk ?? 0
                  }
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
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </Section>
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
