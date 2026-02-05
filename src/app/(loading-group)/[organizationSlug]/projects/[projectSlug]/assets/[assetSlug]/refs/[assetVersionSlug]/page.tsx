"use client";
import { QueryArtifactSelector } from "@/components/ArtifactSelector";
import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import Section from "@/components/common/Section";
import Page from "@/components/Page";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useAssetBranchesAndTags } from "@/hooks/useActiveAssetVersion";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { useViewMode } from "@/hooks/useViewMode";
import "@xyflow/react/dist/style.css";
import { usePathname, useSearchParams } from "next/navigation";
import { FunctionComponent, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../../../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../../../../../components/ui/tabs";

import AverageFixingTimeChart from "@/components/AverageFixingTimeChart";
import { VulnerableComponents } from "@/components/VulnerableComponents";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { groupBy } from "lodash";
import { OctagonAlertIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import useSWR from "swr";
import { RiskHistoryDistributionDiagram } from "../../../../../../../../../components/RiskHistoryDistributionDiagram";
import SeverityCard from "../../../../../../../../../components/SeverityCard";
import { Badge } from "../../../../../../../../../components/ui/badge";
import { AsyncButton } from "../../../../../../../../../components/ui/button";
import VulnEventItem from "../../../../../../../../../components/VulnEventItem";
import { useArtifacts } from "../../../../../../../../../context/AssetVersionContext";
import { fetcher } from "../../../../../../../../../data-fetcher/fetcher";
import useDecodedParams from "../../../../../../../../../hooks/useDecodedParams";
import {
  AverageFixingTime,
  ComponentRisk,
  LicenseResponse,
  Paged,
  RiskHistory,
  VulnEventDTO,
} from "../../../../../../../../../types/api/api";
import { reduceRiskHistories } from "../../../../../../../../../utils/view";
import { classNames } from "../../../../../../../../../utils/common";
import { Skeleton } from "../../../../../../../../../components/ui/skeleton";

const Index: FunctionComponent = () => {
  const [mode, setMode] = useViewMode("devguard-asset-view-mode");
  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject()!;
  const activeAsset = useActiveAsset()!;
  const assetMenu = useAssetMenu();
  const artifacts = useArtifacts();
  const { branches, tags } = useAssetBranchesAndTags();

  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    useDecodedParams() as {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
    };
  const selectedArtifact = useSearchParams()?.get("artifact") || undefined;

  const { data: events, isLoading: eventsLoading } = useSWR<
    Paged<VulnEventDTO>
  >(
    "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/refs/" +
      assetVersionSlug +
      "/events/?pageSize=4",
    fetcher,
  );

  const url =
    "/organizations/" +
    organizationSlug +
    "/projects/" +
    projectSlug +
    "/assets/" +
    assetSlug +
    "/refs/" +
    assetVersionSlug;

  const urlQueryAppendixForArtifact = selectedArtifact
    ? "?artifactName=" + encodeURIComponent(selectedArtifact)
    : "";
  const urlAppendixForArtifact = selectedArtifact
    ? "&artifactName=" + encodeURIComponent(selectedArtifact)
    : "";

  const { data: componentRisk, isLoading: componentRiskLoading } =
    useSWR<ComponentRisk>(
      url + "/stats/component-risk/" + urlQueryAppendixForArtifact,
      fetcher,
    );
  const { data: riskHistoryResp, isLoading: riskHistoryLoading } = useSWR<
    RiskHistory[]
  >(
    url +
      "/stats/risk-history/?start=" +
      extractDateOnly(last3Month) +
      "&end=" +
      extractDateOnly(new Date()) +
      urlAppendixForArtifact,
    fetcher,
  );

  const { data: avgLowFixingTime, isLoading: avgLowFixingTimeLoading } =
    useSWR<AverageFixingTime>(
      url + "/stats/average-fixing-time/?severity=low" + urlAppendixForArtifact,
      fetcher,
    );
  const { data: avgMediumFixingTime, isLoading: avgMediumFixingTimeLoading } =
    useSWR<AverageFixingTime>(
      url +
        "/stats/average-fixing-time/?severity=medium" +
        urlAppendixForArtifact,
      fetcher,
    );
  const { data: avgHighFixingTime, isLoading: avgHighFixingTimeLoading } =
    useSWR<AverageFixingTime>(
      url +
        "/stats/average-fixing-time/?severity=high" +
        urlAppendixForArtifact,
      fetcher,
    );
  const {
    data: avgCriticalFixingTime,
    isLoading: avgCriticalFixingTimeLoading,
  } = useSWR<AverageFixingTime>(
    url +
      "/stats/average-fixing-time/?severity=critical" +
      urlAppendixForArtifact,
    fetcher,
  );

  const { data: licenses, isLoading: licenseLoading } = useSWR<
    LicenseResponse[]
  >(
    "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/refs/" +
      assetVersionSlug +
      "/components/licenses/" +
      urlQueryAppendixForArtifact,
    fetcher,
  );

  const riskHistory = useMemo(() => {
    const groups = groupBy(riskHistoryResp, "day");
    const days = Object.keys(groups).sort();
    const completeRiskHistory: RiskHistory[][] = days.map((day) => {
      return groups[day];
    });
    return reduceRiskHistories(completeRiskHistory);
  }, [riskHistoryResp]);

  const project = activeProject;
  const asset = activeAsset;

  const pathname = usePathname();

  const downloadPdfReport = async () => {
    try {
      const response = await fetch(
        `${pathname}/vulnerability-report.pdf?${new URLSearchParams({
          artifact: selectedArtifact || "",
        })}`,
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
      <div className="flex flex-row items-start justify-between">
        <div className="flex items-center gap-2">
          <BranchTagSelector branches={branches} tags={tags} />
        </div>

        <div className="flex relative flex-col">
          <AsyncButton
            disabled={selectedArtifact === undefined}
            onClick={downloadPdfReport}
            variant={"secondary"}
          >
            Download PDF-Report
          </AsyncButton>
          {!Boolean(selectedArtifact) && (
            <small className="mt-1 absolute right-0 text-right top-full w-52 text-muted-foreground">
              Select an artifact to include it in the report.
            </small>
          )}
        </div>
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
          <div className="relative flex flex-row gap-4">
            <QueryArtifactSelector
              unassignPossible
              artifacts={(artifacts ?? []).map((a) => a.artifactName)}
            />
            <div className="mb-4 flex">
              <TabsList>
                <TabsTrigger value="risk">Risk values</TabsTrigger>
                <TabsTrigger value="cvss">CVSS values</TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value={mode} className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <SeverityCard
                variant="critical"
                queryIntervalStart={8.9}
                isLoading={riskHistoryLoading}
                queryIntervalEnd={10}
                currentAmount={
                  mode === "risk"
                    ? (latest?.cvePurlCritical ?? 0)
                    : (latest?.cvePurlCriticalCvss ?? 0)
                }
                mode={mode}
              />
              <SeverityCard
                variant="high"
                queryIntervalStart={6.9}
                isLoading={riskHistoryLoading}
                queryIntervalEnd={9}
                currentAmount={
                  mode === "risk"
                    ? (latest?.cvePurlHigh ?? 0)
                    : (latest?.cvePurlHighCvss ?? 0)
                }
                mode={mode}
              />
              <SeverityCard
                variant="medium"
                queryIntervalStart={3.9}
                queryIntervalEnd={7}
                isLoading={riskHistoryLoading}
                currentAmount={
                  mode === "risk"
                    ? (latest?.cvePurlMedium ?? 0)
                    : (latest?.cvePurlMediumCvss ?? 0)
                }
                mode={mode}
              />
              <SeverityCard
                variant="low"
                queryIntervalStart={0}
                queryIntervalEnd={4}
                isLoading={riskHistoryLoading}
                currentAmount={
                  mode === "risk"
                    ? (latest?.cvePurlLow ?? 0)
                    : (latest?.cvePurlLowCvss ?? 0)
                }
                mode={mode}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <VulnerableComponents
                isLoading={componentRiskLoading}
                mode={mode}
                data={componentRisk}
              />

              <Card className="col-span-2 flex flex-col">
                <CardHeader>
                  <CardTitle className="relative w-full">
                    Licenses
                    <Link
                      href={
                        asset
                          ? `/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/refs/${assetVersionSlug}/dependencies`
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
                    {licenseLoading
                      ? Array.from(Array(5).keys()).map((_, i, arr) => (
                          <Skeleton
                            className={classNames(
                              "h-[46px]",
                              i === arr.length - 1 ? "mt-4" : "border-b my-4",
                            )}
                            key={i}
                          />
                        ))
                      : (licenses || []).slice(0, 5).map((el, i, arr) => (
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
            <RiskHistoryDistributionDiagram
              isLoading={riskHistoryLoading}
              data={riskHistory}
              mode={mode}
            />
            <div className="grid grid-cols-8 gap-4">
              <div className="col-span-4 grid grid-cols-2 gap-4">
                <AverageFixingTimeChart
                  mode={mode}
                  variant="critical"
                  title="Avg. remediation time"
                  description="Time for critical severity vulnerabilities"
                  isLoading={avgCriticalFixingTimeLoading}
                  avgFixingTime={avgCriticalFixingTime}
                />

                <AverageFixingTimeChart
                  mode={mode}
                  variant="high"
                  title="Avg. remediation time"
                  description="Time for high severity vulnerabilities"
                  avgFixingTime={avgHighFixingTime}
                  isLoading={avgHighFixingTimeLoading}
                />

                <AverageFixingTimeChart
                  mode={mode}
                  variant="medium"
                  title="Avg. remediation time"
                  description="Time for medium severity vulnerabilities"
                  avgFixingTime={avgMediumFixingTime}
                  isLoading={avgMediumFixingTimeLoading}
                />

                <AverageFixingTimeChart
                  mode={mode}
                  variant="low"
                  title="Avg. remediation time"
                  description="Time for low severity vulnerabilities"
                  avgFixingTime={avgLowFixingTime}
                  isLoading={avgLowFixingTimeLoading}
                />
              </div>
              <Card className="col-span-4 flex flex-col">
                <CardHeader>
                  <CardTitle className="relative w-full">
                    Activity Stream
                    <Link
                      href={
                        asset
                          ? `/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/refs/${assetVersionSlug}/events`
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

                      {eventsLoading
                        ? Array.from(Array(4).keys()).map((el) => (
                            <Skeleton key={el} className="w-full h-20" />
                          ))
                        : events?.data.map((event, index, events) => {
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

const extractDateOnly = (date: Date) => date.toISOString().split("T")[0];
const last3Month = new Date();
last3Month.setMonth(last3Month.getMonth() - 3);
