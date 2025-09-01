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

// ...existing code...
import { FunctionComponent } from "react";

import { QueryArtifactSelector } from "@/components/ArtifactSelector";
import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import Section from "@/components/common/Section";
import { withAssetVersion } from "@/decorators/withAssetVersion";
import { withContentTree } from "@/decorators/withContentTree";
import { useAssetBranchesAndTags } from "@/hooks/useActiveAssetVersion";
import { useViewMode } from "@/hooks/useViewMode";
import { useRouter } from "next/router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../../../../components/ui/tabs";

import AverageFixingTimeChart from "@/components/AverageFixingTimeChart";
import { VulnerableComponents } from "@/components/VulnerableComponents";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { OctagonAlertIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { RiskHistoryDistributionDiagram } from "../../../../../../../../components/RiskHistoryDistributionDiagram";
import SeverityCard from "../../../../../../../../components/SeverityCard";
import { Badge } from "../../../../../../../../components/ui/badge";
import { AsyncButton } from "../../../../../../../../components/ui/button";
import VulnEventItem from "../../../../../../../../components/VulnEventItem";
import { withArtifacts } from "../../../../../../../../decorators/withArtifacts";
import { useArtifacts } from "../../../../../../../../hooks/useArtifacts";
import { fetchAssetStats } from "../../../../../../../../services/statService";
import {
  AverageFixingTime,
  ComponentRisk,
  LicenseResponse,
  Paged,
  RiskHistory,
  VulnEventDTO,
} from "../../../../../../../../types/api/api";

interface Props {
  componentRisk: ComponentRisk;
  riskHistory: RiskHistory[];
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
  avgLowFixingTime,
  avgMediumFixingTime,
  avgHighFixingTime,
  avgCriticalFixingTime,
  licenses,
  events,
}) => {
  const [mode, setMode] = useViewMode("devguard-asset-view-mode");
  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject();
  const activeAsset = useActiveAsset();
  const assetMenu = useAssetMenu();
  const artifacts = useArtifacts() || [];
  const router = useRouter();
  const { branches, tags } = useAssetBranchesAndTags();

  const project = activeProject;
  const asset = activeAsset;

  const downloadPdfReport = async () => {
    try {
      const response = await fetch(
        `${router.asPath}/vulnerability-report.pdf`,
        {
          signal: AbortSignal.timeout(60 * 8 * 1000), // 8 minutes timeout
          method: "GET",
        },
      );
      if (!response.ok) {
        toast.error(
          "Failed to download Vulnerability Report PDF. Please try again later.",
        );
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // add download attribute to the link
      link.download = `vulnerability-report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error("Failed to download SBOM PDF. Please try again later.");
    }
  };

  const latest = riskHistory?.length
    ? riskHistory[riskHistory.length - 1]
    : null;

  return (
    <Page
      Menu={assetMenu}
      title="Overview"
      description="Overview of the repository"
      Title={<AssetTitle />}
    >
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <BranchTagSelector branches={branches} tags={tags} />
          <QueryArtifactSelector
            artifacts={(artifacts ?? []).map((a) => a.artifactName)}
          />
        </div>
        <AsyncButton onClick={downloadPdfReport} variant={"secondary"}>
          Download PDF-Report
        </AsyncButton>
      </div>
      <Section
        primaryHeadline
        forceVertical
        description="Have a look at the overall health of your repository."
        title="Overview"
      >
        <Tabs
          value={mode}
          onValueChange={(value) => setMode(value as "risk" | "cvss")}
          className="w-full"
        >
          <div className="mb-4 flex">
            <TabsList>
              <TabsTrigger value="risk">Risk values</TabsTrigger>
              <TabsTrigger value="cvss">CVSS values</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={mode} className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <SeverityCard
                variant="critical"
                queryIntervalStart={9}
                queryIntervalEnd={10}
                currentAmount={
                  mode === "risk"
                    ? (latest?.critical ?? 0)
                    : (latest?.criticalCvss ?? 0)
                }
                mode={mode}
              />
              <SeverityCard
                variant="high"
                queryIntervalStart={7}
                queryIntervalEnd={8}
                currentAmount={
                  mode === "risk"
                    ? (latest?.high ?? 0)
                    : (latest?.highCvss ?? 0)
                }
                mode={mode}
              />
              <SeverityCard
                variant="medium"
                queryIntervalStart={4}
                queryIntervalEnd={7}
                currentAmount={
                  mode === "risk"
                    ? (latest?.medium ?? 0)
                    : (latest?.mediumCvss ?? 0)
                }
                mode={mode}
              />
              <SeverityCard
                variant="low"
                queryIntervalStart={0}
                queryIntervalEnd={3}
                currentAmount={
                  mode === "risk" ? (latest?.low ?? 0) : (latest?.lowCvss ?? 0)
                }
                mode={mode}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <VulnerableComponents mode={mode} data={componentRisk} />
              <div className="col-span-2 flex flex-col">
                <Card>
                  <CardHeader>
                    <CardTitle className="relative w-full">
                      Licenses
                      <Link
                        href={
                          asset
                            ? `/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/refs/${router.query.assetVersionSlug}/dependencies`
                            : "#"
                        }
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
                    <div className="flex -mt-4 flex-col">
                      {licenses.slice(0, 5).map((el, i, arr) => (
                        <div
                          className={
                            i === arr.length - 1 ? "pt-4" : "border-b py-4"
                          }
                          key={el.license.licenseId}
                        >
                          <div className="mb-1 flex flex-row items-center gap-2 text-sm font-semibold">
                            <span className="capitalize">
                              {el.license.licenseId}
                            </span>
                            <div className="flex flex-row flex-wrap gap-2">
                              {el.license.isOsiApproved ? (
                                <Badge variant={"secondary"}>
                                  <CheckBadgeIcon className="-ml-1.5 mr-1 inline-block h-4 w-4 text-green-500" />
                                  OSI Approved
                                </Badge>
                              ) : (
                                <Badge variant={"secondary"}>
                                  <OctagonAlertIcon className="-ml-1.5 -mr-1.5 inline-block h-4 w-4 text-amber-500" />
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
            <RiskHistoryDistributionDiagram data={riskHistory} mode={mode} />
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
                      href={
                        asset
                          ? `/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/refs/${router.query.assetVersionSlug}/events`
                          : "#"
                      }
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
          </TabsContent>
        </Tabs>
      </Section>
    </Page>
  );
};
export default Index;

export const getServerSideProps = middleware(
  async (
    context: GetServerSidePropsContext,
    { artifacts },
  ): Promise<{ props: Props }> => {
    const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
      context.params!;
    const apiClient = getApiClientFromContext(context);

    if (!artifacts || artifacts.length === 0) {
      const events = await apiClient(
        "/organizations/" +
          organizationSlug +
          "/projects/" +
          projectSlug +
          "/assets/" +
          assetSlug +
          "/refs/" +
          assetVersionSlug +
          "/events/?pageSize=3",
      ).then((r) => r.json());
      return {
        props: {
          componentRisk: {},
          avgCriticalFixingTime: { averageFixingTimeSeconds: 0 },
          avgHighFixingTime: { averageFixingTimeSeconds: 0 },
          avgMediumFixingTime: { averageFixingTimeSeconds: 0 },
          avgLowFixingTime: { averageFixingTimeSeconds: 0 },
          events,
          riskHistory: [],
          licenses: [],
        },
      };
    }

    const artifact = artifacts[0];

    const {
      componentRisk,
      riskHistory,
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
      artifactName: artifact.artifactName,
    });

    return {
      props: {
        componentRisk,
        riskHistory,
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
    artifacts: withArtifacts,
  },
);
