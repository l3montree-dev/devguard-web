import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { middleware } from "@/decorators/middleware";
import { withContentTree } from "@/decorators/withContentTree";
import { withOrganization } from "@/decorators/withOrganization";
import { withProject } from "@/decorators/withProject";
import { useProjectMenu } from "@/hooks/useProjectMenu";
import { useViewMode } from "@/hooks/useViewMode";
import { beautifyPurl, classNames } from "@/utils/common";
import { GetServerSidePropsContext } from "next";
import { FunctionComponent, useMemo } from "react";
import Page from "../../../../components/Page";
import { withOrgs } from "../../../../decorators/withOrgs";
import { withSession } from "../../../../decorators/withSession";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import { getApiClientFromContext } from "../../../../services/devGuardApi";
import {
  AssetDTO,
  AverageFixingTime,
  Paged,
  ProjectDTO,
  ReleaseDTO,
  ReleaseRiskHistory,
  RiskHistory,
} from "../../../../types/api/api";

import { groupBy } from "lodash";
import { useRouter } from "next/router";
import { QueryArtifactSelector } from "../../../../components/ArtifactSelector";
import Avatar from "../../../../components/Avatar";
import AverageFixingTimeChart from "../../../../components/AverageFixingTimeChart";
import EmptyParty from "../../../../components/common/EmptyParty";
import ProjectTitle from "../../../../components/common/ProjectTitle";
import Section from "../../../../components/common/Section";
import CVERainbowBadge from "../../../../components/CVERainbowBadge";
import { RiskHistoryDistributionDiagram } from "../../../../components/RiskHistoryDistributionDiagram";
import SeverityCard from "../../../../components/SeverityCard";
import { Button } from "../../../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import { normalizeContentTree } from "../../../../zustand/globalStore";
import { useStore } from "../../../../zustand/globalStoreProvider";

interface Props {
  project: ProjectDTO & {
    assets: Array<AssetDTO>;
  };
  // risk history for each day - each asset - thus double array
  riskHistory: Array<Array<RiskHistory>>;
  reducedRiskHistory: Array<ReleaseRiskHistory>;
  releases: Paged<ReleaseDTO>;
  avgLowFixingTime: AverageFixingTime;
  avgMediumFixingTime: AverageFixingTime;
  avgHighFixingTime: AverageFixingTime;
  avgCriticalFixingTime: AverageFixingTime;
}

const Index: FunctionComponent<Props> = ({
  project,
  riskHistory,
  avgLowFixingTime,
  avgMediumFixingTime,
  avgHighFixingTime,
  releases,
  avgCriticalFixingTime,
  reducedRiskHistory,
}) => {
  const [mode, setMode] = useViewMode("devguard-view-mode");
  const activeOrg = useActiveOrg();
  const projectMenu = useProjectMenu();
  const router = useRouter();
  const contentTree = useStore((state) => state.contentTree);
  const normalizedContentTree = useMemo(() => {
    return normalizeContentTree(contentTree || []);
  }, [contentTree]);

  if (releases.data.length === 0) {
    return (
      <Page title={project.name} Menu={projectMenu} Title={<ProjectTitle />}>
        <EmptyParty
          title={"No data available for this group yet..."}
          Button={
            <Button
              onClick={() => {
                router.push(
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
          artifacts={releases.data?.map((r) => r.name) || []}
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
                variant="critical"
                currentAmount={
                  mode === "risk"
                    ? riskHistory[riskHistory.length - 1].reduce(
                        (sum, r) => sum + (r?.critical ?? 0),
                        0,
                      )
                    : riskHistory[riskHistory.length - 1].reduce(
                        (sum, r) => sum + (r?.criticalCvss ?? 0),
                        0,
                      )
                }
                queryIntervalStart={7}
                queryIntervalEnd={10}
                mode={mode}
              />
              <SeverityCard
                variant="high"
                currentAmount={
                  mode === "risk"
                    ? riskHistory[riskHistory.length - 1].reduce(
                        (sum, r) => sum + (r?.high ?? 0),
                        0,
                      )
                    : riskHistory[riskHistory.length - 1].reduce(
                        (sum, r) => sum + (r?.highCvss ?? 0),
                        0,
                      )
                }
                queryIntervalStart={4}
                queryIntervalEnd={7}
                mode={mode}
              />
              <SeverityCard
                variant="medium"
                currentAmount={
                  mode === "risk"
                    ? riskHistory[riskHistory.length - 1].reduce(
                        (sum, r) => sum + (r?.medium ?? 0),
                        0,
                      )
                    : riskHistory[riskHistory.length - 1].reduce(
                        (sum, r) => sum + (r?.mediumCvss ?? 0),
                        0,
                      )
                }
                queryIntervalStart={1}
                queryIntervalEnd={4}
                mode={mode}
              />
              <SeverityCard
                variant="low"
                currentAmount={
                  mode === "risk"
                    ? riskHistory[riskHistory.length - 1].reduce(
                        (sum, r) => sum + (r?.low ?? 0),
                        0,
                      )
                    : riskHistory[riskHistory.length - 1].reduce(
                        (sum, r) => sum + (r?.lowCvss ?? 0),
                        0,
                      )
                }
                queryIntervalStart={0}
                queryIntervalEnd={1}
                mode={mode}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="grid grid-cols-2 col-span-2 gap-4">
                <AverageFixingTimeChart
                  variant="critical"
                  title="Avg. remediation time"
                  description="Average fixing time for critical severity flaws"
                  avgFixingTime={avgCriticalFixingTime}
                />
                <AverageFixingTimeChart
                  title="Avg. remediation time"
                  variant="high"
                  description="Average fixing time for high severity flaws"
                  avgFixingTime={avgHighFixingTime}
                />
                <AverageFixingTimeChart
                  title="Avg. remediation time"
                  variant="medium"
                  description="Average fixing time for medium severity flaws"
                  avgFixingTime={avgMediumFixingTime}
                />
                <AverageFixingTimeChart
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
                    {riskHistory.length > 0 &&
                      riskHistory[riskHistory.length - 1]
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
                                <div className="mb-1 flex flex-row items-center gap-2 text-sm font-semibold">
                                  <span className="text-foreground">
                                    {beautifyPurl(r.artifactName || "")}
                                  </span>
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
                data={reducedRiskHistory}
                mode={mode}
              />
            </div>
          </TabsContent>
        </Tabs>
      </Section>
    </Page>
  );
};
export default Index;

const extractDateOnly = (date: Date) => date.toISOString().split("T")[0];

const reduceRiskHistories = (
  histories: RiskHistory[][],
): Array<ReleaseRiskHistory> => {
  return histories.map((dayHistories) => {
    return dayHistories.reduce(
      (acc, curr) => {
        acc.low += curr.low;
        acc.medium += curr.medium;
        acc.high += curr.high;
        acc.critical += curr.critical;
        acc.lowCvss += curr.lowCvss;
        acc.mediumCvss += curr.mediumCvss;
        acc.highCvss += curr.highCvss;
        acc.criticalCvss += curr.criticalCvss;
        return acc;
      },
      {
        id: dayHistories[0]?.id || "",
        day: dayHistories[0]?.day || new Date(),
        assetId: dayHistories[0]?.assetId || "",
        artifactName: dayHistories[0]?.artifactName || "",
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
        lowCvss: 0,
        mediumCvss: 0,
        highCvss: 0,
        criticalCvss: 0,
      } as RiskHistory,
    );
  });
};

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext, { project }) => {
    let { organizationSlug, projectSlug } = context.params!;
    const { artifact } = context.query;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const last3Month = new Date();
    last3Month.setMonth(last3Month.getMonth() - 3);

    const apiClient = getApiClientFromContext(context);

    const releasesResp = await apiClient(
      `/organizations/${organizationSlug}/projects/${project.slug}/releases/`,
    );
    const releases = (
      releasesResp.ok ? await releasesResp.json() : { data: [] }
    ) as Paged<ReleaseDTO>;

    let releaseId;

    const artifactIndex = releases.data.findIndex((r) => r.name === artifact);
    if (!artifact || artifactIndex === -1) {
      releaseId = releases.data.length > 0 ? releases.data[0].id : undefined;
    } else {
      releaseId = releases.data[artifactIndex].id;
    }

    let riskHistory: Array<any> = [];
    let avgLowFixingTime: AverageFixingTime = { averageFixingTimeSeconds: 0 };
    let avgMediumFixingTime: AverageFixingTime = {
      averageFixingTimeSeconds: 0,
    };
    let avgHighFixingTime: AverageFixingTime = { averageFixingTimeSeconds: 0 };
    let avgCriticalFixingTime: AverageFixingTime = {
      averageFixingTimeSeconds: 0,
    };

    if (releaseId) {
      const url =
        "/organizations/" +
        organizationSlug +
        "/projects/" +
        projectSlug +
        "/releases/" +
        releaseId +
        "/stats";
      [
        riskHistory,
        avgLowFixingTime,
        avgMediumFixingTime,
        avgHighFixingTime,
        avgCriticalFixingTime,
      ] = await Promise.all([
        apiClient(
          url +
            "/risk-history?start=" +
            extractDateOnly(last3Month) +
            "&end=" +
            extractDateOnly(new Date()),
        ).then(
          (r) =>
            r.json() as Promise<
              Array<
                | { riskHistory: RiskHistory[]; asset: AssetDTO }
                | {
                    riskHistory: [];
                    project: ProjectDTO;
                  }
              >
            >,
        ),
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
    }

    /*
    // check the longest array in the results
	longest := 0
	var firstDay *time.Time = nil
	for _, r := range results {
		if len(r.RiskHistory) > longest {
			longest = len(r.RiskHistory)
		}
		if len(r.RiskHistory) > 0 && (firstDay == nil || r.RiskHistory[0].Day.Before(*firstDay)) {
			firstDay = &r.RiskHistory[0].Day
		}
	}
    */
    const groups = groupBy(riskHistory, "day");
    const days = Object.keys(groups).sort();
    const completeRiskHistory: RiskHistory[][] = days.map((day) => {
      return groups[day];
    });

    // also fetch releases for artifact selector on project overview

    return {
      props: {
        project,
        releases,
        riskHistory: completeRiskHistory,
        reducedRiskHistory: reduceRiskHistories(completeRiskHistory),
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
    contentTree: withContentTree,
  },
);
