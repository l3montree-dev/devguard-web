"use client";

import { groupBy } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import useSWR from "swr";
import { QueryArtifactSelector } from "../../../../../../components/ArtifactSelector";
import Avatar from "../../../../../../components/Avatar";
import AverageFixingTimeChart from "../../../../../../components/AverageFixingTimeChart";
import EmptyParty from "../../../../../../components/common/EmptyParty";
import ProjectTitle from "../../../../../../components/common/ProjectTitle";
import Section from "../../../../../../components/common/Section";
import CVERainbowBadge from "../../../../../../components/CVERainbowBadge";
import Page from "../../../../../../components/Page";
import { RiskHistoryDistributionDiagram } from "../../../../../../components/RiskHistoryDistributionDiagram";
import SeverityCard from "../../../../../../components/SeverityCard";
import { Button } from "../../../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../../components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../../../../components/ui/tooltip";
import { useOrganization } from "../../../../../../context/OrganizationContext";
import { useProject } from "../../../../../../context/ProjectContext";
import { useActiveOrg } from "../../../../../../hooks/useActiveOrg";
import { fetcher } from "../../../../../../data-fetcher/fetcher";
import useDecodedParams from "../../../../../../hooks/useDecodedParams";
import { useProjectMenu } from "../../../../../../hooks/useProjectMenu";
import { useViewMode } from "../../../../../../hooks/useViewMode";
import {
  AverageFixingTime,
  Paged,
  ReleaseDTO,
  RiskHistory,
} from "../../../../../../types/api/api";
import { beautifyPurl, classNames } from "../../../../../../utils/common";
import {
  normalizeContentTree,
  reduceRiskHistories,
} from "../../../../../../utils/view";

const OverviewPage = () => {
  const search = useSearchParams();
  const params = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
  };
  let { organizationSlug, projectSlug } = params;
  const artifact = search?.get("artifact");

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const last3Month = new Date();
  last3Month.setMonth(last3Month.getMonth() - 3);

  const { data: releases } = useSWR<Paged<ReleaseDTO>>(
    `/organizations/${organizationSlug}/projects/${projectSlug}/releases/`,
  );

  let releaseId: string | undefined = undefined;

  if (releases) {
    const artifactIndex = releases.data.findIndex((r) => r.name === artifact);
    if (!artifact || artifactIndex === -1) {
      releaseId = releases.data.length > 0 ? releases.data[0].id : undefined;
    } else {
      releaseId = releases.data[artifactIndex].id;
    }
  }

  // fetch all the data
  const { data: riskHistory, isLoading: riskHistoryLoading } = useSWR<
    RiskHistory[]
  >(
    () =>
      releaseId
        ? "/organizations/" +
          organizationSlug +
          "/projects/" +
          projectSlug +
          "/releases/" +
          releaseId +
          "/stats"
        : null,
    fetcher,
  );

  const { data: avgLowFixingTime, isLoading: avgLowFixingTimeLoading } =
    useSWR<AverageFixingTime>(
      () =>
        releaseId
          ? "/organizations/" +
            organizationSlug +
            "/projects/" +
            projectSlug +
            "/releases/" +
            releaseId +
            "/average-fixing-time?severity=low"
          : null,
      fetcher,
    );

  const { data: avgMediumFixingTime, isLoading: avgMediumFixingTimeLoading } =
    useSWR<AverageFixingTime>(
      () =>
        releaseId
          ? "/organizations/" +
            organizationSlug +
            "/projects/" +
            projectSlug +
            "/releases/" +
            releaseId +
            "/average-fixing-time?severity=medium"
          : null,
      fetcher,
    );

  const { data: avgHighFixingTime, isLoading: avgHighFixingTimeLoading } =
    useSWR<AverageFixingTime>(
      () =>
        releaseId
          ? "/organizations/" +
            organizationSlug +
            "/projects/" +
            projectSlug +
            "/releases/" +
            releaseId +
            "/average-fixing-time?severity=high"
          : null,
      fetcher,
    );
  const {
    data: avgCriticalFixingTime,
    isLoading: avgCriticalFixingTimeLoading,
  } = useSWR<AverageFixingTime>(
    () =>
      releaseId
        ? "/organizations/" +
          organizationSlug +
          "/projects/" +
          projectSlug +
          "/releases/" +
          releaseId +
          "/average-fixing-time?severity=critical"
        : null,
    fetcher,
    { suspense: true },
  );

  const completeRiskHistory: RiskHistory[][] = useMemo(() => {
    const groups = groupBy(riskHistory ?? [], "day");
    const days = Object.keys(groups).sort();
    return days.map((day) => {
      return groups[day];
    });
  }, [riskHistory]);

  const project = useProject()!;
  const [mode, setMode] = useViewMode("devguard-view-mode");
  const activeOrg = useActiveOrg();
  const projectMenu = useProjectMenu();
  const router = useRouter();
  const contentTree = useOrganization().contentTree;

  const normalizedContentTree = useMemo(() => {
    return normalizeContentTree(contentTree || []);
  }, [contentTree]);

  const criticalAmount = useMemo(() => {
    if (completeRiskHistory.length === 0) return 0;
    if (mode === "cvss") {
      return completeRiskHistory[completeRiskHistory.length - 1].reduce(
        (sum, r) => sum + (r?.criticalCvss ?? 0),
        0,
      );
    }
    return completeRiskHistory[completeRiskHistory.length - 1].reduce(
      (sum, r) => sum + (r?.critical ?? 0),
      0,
    );
  }, [completeRiskHistory, mode]);

  const highAmount = useMemo(() => {
    if (completeRiskHistory.length === 0) return 0;
    if (mode === "cvss") {
      return completeRiskHistory[completeRiskHistory.length - 1].reduce(
        (sum, r) => sum + (r?.highCvss ?? 0),
        0,
      );
    }
    return completeRiskHistory[completeRiskHistory.length - 1].reduce(
      (sum, r) => sum + (r?.high ?? 0),
      0,
    );
  }, [completeRiskHistory, mode]);

  const mediumAmount = useMemo(() => {
    if (completeRiskHistory.length === 0) return 0;
    if (mode === "cvss") {
      return completeRiskHistory[completeRiskHistory.length - 1].reduce(
        (sum, r) => sum + (r?.mediumCvss ?? 0),
        0,
      );
    }
    return completeRiskHistory[completeRiskHistory.length - 1].reduce(
      (sum, r) => sum + (r?.medium ?? 0),
      0,
    );
  }, [completeRiskHistory, mode]);

  const lowAmount = useMemo(() => {
    if (completeRiskHistory.length === 0) return 0;
    if (mode === "cvss") {
      return completeRiskHistory[completeRiskHistory.length - 1].reduce(
        (sum, r) => sum + (r?.lowCvss ?? 0),
        0,
      );
    }
    return completeRiskHistory[completeRiskHistory.length - 1].reduce(
      (sum, r) => sum + (r?.low ?? 0),
      0,
    );
  }, [completeRiskHistory, mode]);

  if (releases?.data.length === 0) {
    return (
      <Page title={project.name} Menu={projectMenu} Title={<ProjectTitle />}>
        <EmptyParty
          title={"No data available for this group yet..."}
          Button={
            <Button
              onClick={() => {
                router?.push(
                  `/${activeOrg.slug}/projects/${project.slug}/releases`,
                );
              }}
            >
              Create new release
            </Button>
          }
          description="Create a release to group multiple repository artifacts into their own release. This allows you to track and monitor your software over time."
        />
      </Page>
    );
  }

  return (
    <Page title={project.name} Menu={projectMenu} Title={<ProjectTitle />}>
      <div className="mb-4">
        <QueryArtifactSelector
          artifacts={releases?.data?.map((r) => r.name) || []}
        />
      </div>

      <Section
        primaryHeadline
        forceVertical
        description="Have a look at the overall health of your group and its repositories."
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
                isLoading={riskHistoryLoading}
                variant="critical"
                currentAmount={criticalAmount}
                queryIntervalStart={7}
                queryIntervalEnd={10}
                mode={mode}
              />
              <SeverityCard
                isLoading={riskHistoryLoading}
                variant="high"
                currentAmount={highAmount}
                queryIntervalStart={4}
                queryIntervalEnd={7}
                mode={mode}
              />
              <SeverityCard
                isLoading={riskHistoryLoading}
                variant="medium"
                currentAmount={mediumAmount}
                queryIntervalStart={1}
                queryIntervalEnd={4}
                mode={mode}
              />
              <SeverityCard
                isLoading={riskHistoryLoading}
                variant="low"
                currentAmount={lowAmount}
                queryIntervalStart={0}
                queryIntervalEnd={1}
                mode={mode}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="grid grid-cols-2 col-span-2 gap-4">
                <AverageFixingTimeChart
                  mode={mode}
                  isLoading={avgCriticalFixingTimeLoading}
                  variant="critical"
                  title="Avg. remediation time"
                  description="Average fixing time for critical severity flaws"
                  avgFixingTime={avgCriticalFixingTime}
                />
                <AverageFixingTimeChart
                  mode={mode}
                  isLoading={avgHighFixingTimeLoading}
                  title="Avg. remediation time"
                  variant="high"
                  description="Average fixing time for high severity flaws"
                  avgFixingTime={avgHighFixingTime}
                />
                <AverageFixingTimeChart
                  mode={mode}
                  isLoading={avgMediumFixingTimeLoading}
                  title="Avg. remediation time"
                  variant="medium"
                  description="Average fixing time for medium severity flaws"
                  avgFixingTime={avgMediumFixingTime}
                />
                <AverageFixingTimeChart
                  mode={mode}
                  isLoading={avgLowFixingTimeLoading}
                  title="Avg. remediation time"
                  variant="low"
                  description="Average fixing time for low severity flaws"
                  avgFixingTime={avgLowFixingTime}
                />
              </div>

              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Vulnerable Artifacts</CardTitle>
                  <CardDescription>
                    The most vulnerable artifacts in this release
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {completeRiskHistory.length > 0 &&
                      completeRiskHistory[completeRiskHistory.length - 1]
                        .slice(0, 7)
                        .map((r, i, arr) => {
                          const asset = normalizedContentTree[r.assetId || ""];

                          return (
                            <div
                              key={r.id}
                              className={classNames(
                                i === 0
                                  ? "border-b pb-4"
                                  : i === arr.length - 1
                                    ? "pt-4"
                                    : "border-b py-4",
                                "flex items-center flex-row gap-4",
                              )}
                            >
                              <div className="flex-1">
                                <Avatar
                                  name={
                                    asset?.name
                                      ? asset.name
                                      : r.artifactName || ""
                                  }
                                  avatar={asset?.avatar}
                                />
                              </div>
                              <div className="w-full">
                                <div className="mb-1 flex flex-row items-center gap-4 text-sm font-semibold">
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <span className="text-foreground text-left line-clamp-1">
                                        {beautifyPurl(r.artifactName || "")}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {r.artifactName}
                                    </TooltipContent>
                                  </Tooltip>
                                  <div className="flex whitespace-nowrap flex-row flex-wrap gap-2">
                                    <CVERainbowBadge
                                      low={
                                        mode === "risk"
                                          ? (r?.low ?? 0)
                                          : (r?.lowCvss ?? 0)
                                      }
                                      medium={
                                        mode === "risk"
                                          ? (r?.medium ?? 0)
                                          : (r?.mediumCvss ?? 0)
                                      }
                                      high={
                                        mode === "risk"
                                          ? (r?.high ?? 0)
                                          : (r?.highCvss ?? 0)
                                      }
                                      critical={
                                        mode === "risk"
                                          ? (r?.critical ?? 0)
                                          : (r?.criticalCvss ?? 0)
                                      }
                                    />
                                  </div>
                                </div>

                                <p className="text-sm text-muted-foreground">
                                  {asset?.description
                                    ? asset.description
                                    : "No description available"}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                  </div>
                  <div className="flex items-center gap-4"></div>
                </CardContent>
              </Card>
            </div>
            <div className="col-span-2">
              <RiskHistoryDistributionDiagram
                isLoading={riskHistoryLoading}
                data={reduceRiskHistories(completeRiskHistory)}
                mode={mode}
              />
            </div>
          </TabsContent>
        </Tabs>
      </Section>
    </Page>
  );
};

export default OverviewPage;
