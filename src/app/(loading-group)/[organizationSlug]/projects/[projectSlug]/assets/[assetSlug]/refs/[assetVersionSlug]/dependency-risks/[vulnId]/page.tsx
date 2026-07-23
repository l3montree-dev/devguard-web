"use client";

import Page from "@/components/Page";
import RiskSeverityRadialChart from "@/components/RiskSeverityRadialChart";
import AssetTitle from "@/components/common/AssetTitle";

import AuthGuard from "@/components/AuthGuard";
import MitigateDialog from "@/components/MitigateDialog";
import Severity from "@/components/common/Severity";
import VulnState from "@/components/common/VulnState";
import { dependencyRiskTourSteps } from "@/components/common/tours/dependency-risk-tour";
import DetailedRiskAssessment from "@/components/risk-assessment/DetailedRiskAssessment";
import RiskAssessmentFeed from "@/components/risk-assessment/RiskAssessmentFeed";
import RelationCard from "@/components/risk-handling/RelationCard";
import { Badge } from "@/components/ui/badge";
import { AsyncButton, Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AcceptVexRuleRecommendationDialog from "@/components/vex-rules/AcceptVexRuleRecommendationDialog";
import { useSession } from "@/context/SessionContext";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useDeleteEvent } from "@/hooks/useDeleteEvent";
import { usePageTour } from "@/hooks/usePageTour";
import { useTourSeen } from "@/hooks/useTourSeen";
import { isMember, useCurrentUserRole } from "@/hooks/useUserRole";
import { toast } from "@/lib/toast";
import { browserApiClient } from "@/services/devGuardApi";
import type {
  DependencyVulnHints,
  DetailedDependencyVulnDTO,
  VexRule,
  VulnEventDTO,
} from "@/types/api/api";
import { formatDate } from "@/utils/format";
import { getIntegrationNameFromRepositoryIdOrExternalProviderId } from "@/utils/view";
import {
  ShareIcon,
  SpeakerXMarkIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import { BookOpenCheck, Bug, CheckCircleIcon, CircleHelp } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { FunctionComponent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import AcceptRiskDialog from "../../../../../../../../../../../components/AcceptRiskDialog";
import AffectedComponentDetails from "../../../../../../../../../../../components/AffectedComponent";
import ArtifactBadge from "../../../../../../../../../../../components/ArtifactBadge";
import CommentDialog from "../../../../../../../../../../../components/CommentDialog";
import DependencyGraph from "../../../../../../../../../../../components/DependencyGraph";
import FalsePositiveDialog from "../../../../../../../../../../../components/FalsePositiveDialog";
import GitProviderIcon from "../../../../../../../../../../../components/GitProviderIcon";
import Quickfix from "../../../../../../../../../../../components/Quickfix";
import Callout from "../../../../../../../../../../../components/common/Callout";
import Err from "../../../../../../../../../../../components/common/Err";
import Markdown from "../../../../../../../../../../../components/common/Markdown";
import EditorSkeleton from "../../../../../../../../../../../components/risk-assessment/EditorSkeleton";
import RiskAssessmentFeedSkeleton from "../../../../../../../../../../../components/risk-assessment/RiskAssessmentFeedSkeleton";
import { Skeleton } from "../../../../../../../../../../../components/ui/skeleton";
import VexRuleDetailsDialog from "../../../../../../../../../../../components/vex-rules/VexRuleDetailsDialog";
import { fetcher } from "../../../../../../../../../../../data-fetcher/fetcher";
import { useActiveAssetVersion } from "../../../../../../../../../../../hooks/useActiveAssetVersion";
import useDecodedParams from "../../../../../../../../../../../hooks/useDecodedParams";
import type { ViewDependencyTreeNode } from "../../../../../../../../../../../utils/dependencyGraphHelpers";
import { convertPathsToTree } from "../../../../../../../../../../../utils/dependencyGraphHelpers";

const MarkdownEditor = dynamic(
  () => import("@/components/common/MarkdownEditor"),
  {
    ssr: false,
  },
);

const Index: FunctionComponent = () => {
  const { session } = useSession();
  const role = useCurrentUserRole();

  const activeOrg = useActiveOrg();
  const project = useActiveProject()!;

  const assetMenu = useAssetMenu();
  const asset = useActiveAsset()!;
  const assetVersion = useActiveAssetVersion();

  const deleteEvent = useDeleteEvent();
  const currentUser = useCurrentUser();

  const [justification, setJustification] = useState<string | undefined>(
    undefined,
  );

  const [falsePositiveDialogOpen, setFalsePositiveDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [acceptRiskDialogOpen, setAcceptRiskDialogOpen] = useState(false);
  const [mitigateDialogOpen, setMitigateDialogOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [selectedVexRule, setSelectedVexRule] = useState<VexRule | null>(null);
  const [vexRuleDialogOpen, setVexRuleDialogOpen] = useState(false);

  const searchParams = useSearchParams();
  const { startTour, registerSteps } = usePageTour(dependencyRiskTourSteps);
  const { showModal: shouldStartTour, markSeen } =
    useTourSeen("dependency-risk");
  const [
    acceptVexRuleRecommendationDialogOpen,
    setAcceptVexRuleRecommendationDialogOpen,
  ] = useState(false);

  // fetch the project
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug, vulnId } =
    useDecodedParams();

  const uri =
    "/organizations/" +
    organizationSlug +
    "/projects/" +
    projectSlug +
    "/assets/" +
    assetSlug +
    "/refs/" +
    assetVersionSlug +
    "/dependency-vulns/" +
    vulnId;

  const {
    data: vuln,
    mutate,
    error,
  } = useSWR<DetailedDependencyVulnDTO>(uri, fetcher);

  const isLastEventVexRule = useMemo(() => {
    if (!vuln || !vuln.events || vuln.events.length === 0) {
      return false;
    }
    for (let i = vuln.events.length - 1; i >= 0; i--) {
      if (vuln.events[i].type === "rawRiskAssessmentUpdated") {
        continue;
      } else if (vuln.events[i].createdByVexRule) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }, [vuln]);

  const { data: graphResponse, isLoading: graphLoading } = useSWR<
    Array<Array<string>>
  >(
    vuln
      ? `/organizations/${activeOrg.slug}/projects/${project?.slug}/assets/${asset?.slug}/refs/${assetVersion?.slug}/path-to-component/?purl=${encodeURIComponent(vuln.componentPurl)}`
      : null,
    fetcher,
  );

  const handleGraphReady = useCallback(() => {
    if (
      searchParams?.get("startTour") !== "dependency-risk" &&
      !shouldStartTour
    )
      return;
    markSeen();
    registerSteps(dependencyRiskTourSteps);
    startTour();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, shouldStartTour]);

  // Path explosion: no graph is rendered so onReady never fires — start tour directly
  useEffect(() => {
    if (
      (searchParams?.get("startTour") !== "dependency-risk" &&
        !shouldStartTour) ||
      graphLoading ||
      (vuln?.vulnerabilityPath.length || 0) !== 0
    )
      return;
    markSeen();
    registerSteps([
      {
        ...dependencyRiskTourSteps[0],
        content:
          "This vulnerability has too many dependency paths to display a graph.",
      },
      ...dependencyRiskTourSteps.slice(1),
    ]);
    startTour();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphLoading, shouldStartTour]);

  const graphData = useMemo<ViewDependencyTreeNode | null>(() => {
    if (!vuln || vuln.vulnerabilityPath.length === 0) {
      return null;
    }

    return convertPathsToTree([vuln.vulnerabilityPath], [vuln]);
  }, [vuln]);

  // Generate path pattern options for the user to select
  // Each option is a suffix of the vulnerability path with a count of matching paths
  const pathPatternOptions = useMemo(() => {
    // group the graphResponse by suffixes
    if (!graphResponse) return [];
    const suffixMap: { [key: string]: number } = {};
    graphResponse.forEach((path) => {
      for (let i = 1; i <= path.length; i++) {
        const suffix = path.slice(-i);
        const key = suffix.join(" > ");
        if (suffixMap[key]) {
          suffixMap[key] += 1;
        } else {
          suffixMap[key] = 1;
        }
      }
    });
    // create an array of suffixes
    // make sure to sort it

    const sortedSuffixes = Object.entries(suffixMap).sort(([x, a], [y, b]) => {
      return b - a;
    });

    return sortedSuffixes;
  }, [graphResponse]);

  const { data: hints } = useSWR<DependencyVulnHints>(uri + "/hints", fetcher);

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
    mutate();
  };

  const handleSubmit = async (data: {
    status?: VulnEventDTO["type"];
    justification?: string;
    mechanicalJustification?: string;
    pathPattern?: string[];
  }): Promise<boolean> => {
    if (data.status === undefined || !vuln) {
      return false;
    }

    if (!Boolean(data.justification) && !Boolean(data.pathPattern)) {
      toast("Please provide a justification", {
        description: "You need to provide a justification for your decision.",
      });
      return false;
    }

    // instead of sending the pathPattern in the vulnerability event (the vuln

    const optimisticState =
      data.status === "falsePositive"
        ? "falsePositive"
        : data.status === "accepted"
          ? "accepted"
          : data.status === "reopened"
            ? "open"
            : data.status === "comment"
              ? vuln.state
              : undefined;

    const optimisticEvent =
      optimisticState !== undefined
        ? ({
            type: data.status,
            id: "optimistic",
            createdAt: new Date().toISOString(),
            justification: data.justification ?? "",
            mechanicalJustification: data.mechanicalJustification ?? "",
            userId: currentUser?.id ?? "",
            vulnId: vuln.id,
            vulnType: "dependencyVuln",
            vulnerabilityName: vuln.cveID,
            createdByVexRule: false,
          } as VulnEventDTO)
        : undefined;

    const mutatePromise = mutate(
      async (prev) => {
        let json: any;
        if (data.status === "mitigate") {
          const resp = await browserApiClient(
            "/organizations/" +
              activeOrg.slug +
              "/projects/" +
              project.slug +
              "/assets/" +
              asset.slug +
              "/refs/" +
              assetVersion?.slug +
              "/dependency-vulns/" +
              vuln.id +
              "/mitigate",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                comment: data.justification,
              }),
            },
          );
          json = await resp.json();
        } else {
          const resp = await browserApiClient(
            "/organizations/" +
              activeOrg.slug +
              "/projects/" +
              project.slug +
              "/assets/" +
              asset.slug +
              "/refs/" +
              assetVersion?.slug +
              "/dependency-vulns/" +
              vuln.id,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            },
          );
          json = await resp.json();
        }

        if (!json.events) {
          toast("Failed to update vulnerability", {
            description: "Please try again later.",
          });
          throw new Error("Failed to update vulnerability");
        }
        setJustification("");
        return {
          ...prev,
          ...json,
          events: prev?.events.concat([json.events.slice(-1)[0]]),
        };
      },
      {
        optimisticData: optimisticState
          ? {
              ...vuln,
              state: optimisticState,
              events: vuln.events.concat(
                optimisticEvent ? [optimisticEvent] : [],
              ),
            }
          : undefined,
        rollbackOnError: true,
        revalidate: false,
      },
    );

    if (optimisticState !== undefined) {
      // Optimistic update already applied to SWR cache — close the dialog immediately.
      // The mutation continues in the background; on error SWR rolls back and shows a toast.
      mutatePromise
        .then(() =>
          toast("Saved", { description: "Changes confirmed by server." }),
        )
        .catch(() => {});
      return true;
    }

    await mutatePromise;
    return true;
  };

  const integrationName = useMemo(
    () =>
      getIntegrationNameFromRepositoryIdOrExternalProviderId(asset, project),
    [asset, project],
  );

  const { data: recommendedVexRule } = useSWR<VexRule>(
    vuln
      ? `/organizations/${activeOrg.slug}/projects/${project?.slug}/assets/${asset?.slug}/refs/${assetVersion?.slug}/crowdsourced-vexing/recommendation/?dependencyVulnId=${encodeURIComponent(vuln.id)}`
      : null,
    fetcher,
  );

  // Show error state
  if (error) {
    return (
      <Page
        Menu={assetMenu}
        Title={<AssetTitle />}
        title="Error Loading Vulnerability"
      >
        <Err />
      </Page>
    );
  }

  function pathEqual<T>(a: T[], b: T[]) {
    if (a.length === 0 || b.length === 0 || a.length !== b.length) {
      return false;
    }

    return a.every((val, i) => val === b[i]);
  }

  return (
    <Page
      Menu={assetMenu}
      Title={<AssetTitle />}
      title={vuln?.cve?.cve ?? "Vulnerability Details"}
    >
      <div className="flex flex-row gap-4">
        <div className="flex-1">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <div className="flex flex-row items-center gap-4">
                <h1 data-tour="cve-detail" className="text-2xl font-semibold">
                  {vuln ? vuln.cveID : <Skeleton className="w-90 h-10" />}
                </h1>
                {vuln ? (
                  <VulnState state={vuln?.state ?? "open"} />
                ) : (
                  <Skeleton className="w-20 h-6 rounded-full" />
                )}
              </div>
              <div className="mt-4 flex flex-row flex-wrap gap-2 text-sm">
                {vuln?.ticketUrl && (
                  <Link href={vuln.ticketUrl} target="_blank">
                    <Badge className="h-full" variant={"secondary"}>
                      {vuln.ticketId?.startsWith("github:") ? (
                        <Image
                          height={15}
                          src="/assets/github.svg"
                          alt="GitHub Logo"
                          className="-ml-1 mr-2 dark:invert"
                          width={15}
                        />
                      ) : (
                        <div className="mr-2">
                          <GitProviderIcon
                            externalEntityProviderIdOrRepositoryId={
                              asset.externalEntityProviderId ??
                              asset.repositoryId ??
                              "gitlab"
                            }
                          />
                        </div>
                      )}
                      <span>{vuln.ticketUrl}</span>
                    </Badge>
                  </Link>
                )}

                {vuln ? (
                  <Severity risk={vuln.rawRiskAssessment} />
                ) : (
                  <Skeleton className="w-10 h-4" />
                )}
                {}
                {vuln?.artifacts.map((a) => (
                  <ArtifactBadge
                    key={a.artifactName + vuln.id}
                    artifactName={a.artifactName}
                  />
                ))}
              </div>
              <div className="mt-2 cve-description overflow-x-auto text-muted-foreground">
                {vuln ? (
                  <>
                    <Markdown>
                      {descriptionExpanded ||
                      (vuln.cve?.description?.length ?? 0) <= 500
                        ? (vuln.cve?.description ?? "")
                        : `${vuln.cve?.description?.slice(0, 500) ?? ""}...`}
                    </Markdown>
                    {(vuln.cve?.description?.length ?? 0) > 500 && (
                      <button
                        onClick={() =>
                          setDescriptionExpanded(!descriptionExpanded)
                        }
                        className="text-sm text-primary hover:opacity-80 my-2 cursor-pointer"
                      >
                        {descriptionExpanded ? "Show less" : "Read more"}
                      </button>
                    )}
                  </>
                ) : (
                  <Skeleton className="w-full h-20" />
                )}
              </div>
              <div className="mt-8">
                {vuln?.related?.advisory && (
                  <RelationCard
                    related={vuln?.related?.advisory}
                    variant="collapsible"
                  />
                )}
              </div>
              <div data-tour="path">
                {!graphLoading && (
                  <div className="mt-10">
                    {graphData && vuln && (
                      <>
                        <div className="flex flex-row items-center justify-between mb-2">
                          <span className="font-semibold block">
                            Path to component
                          </span>
                          {(vuln?.vulnerabilityPath.length || 0) > 0 &&
                            (graphResponse?.length || 0) > 0 && (
                              <Tooltip>
                                <TooltipTrigger className="text-xs flex items-center">
                                  <ShareIcon className="-ml-1 mr-1 inline-block h-4 w-4" />
                                  Vulnerability is reachable through{" "}
                                  {graphResponse?.length}{" "}
                                  {graphResponse?.length === 1
                                    ? "path"
                                    : "paths"}
                                </TooltipTrigger>
                                <TooltipContent className="max-w-screen-sm font-normal">
                                  <p>
                                    This vulnerability exists in{" "}
                                    {graphResponse?.length} other dependency{" "}
                                    {graphResponse?.length === 1
                                      ? "path"
                                      : "paths"}{" "}
                                    within this asset. When marking as false
                                    positive, you can apply a rule to
                                    automatically mark all paths with matching
                                    suffixes.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                        </div>
                        <div
                          style={{ height: 400 }}
                          className={"w-full rounded-lg border bg-muted"}
                        >
                          {graphData && vuln && (
                            <DependencyGraph
                              variant="compact"
                              width={100}
                              height={400}
                              enableContextMenu={
                                vuln.vulnerabilityPath.length !== 0 &&
                                vuln.state === "open" &&
                                isMember(role)
                              }
                              graph={graphData}
                              vulns={[vuln]}
                              highlightPath={[
                                "ROOT",
                                ...vuln.vulnerabilityPath,
                              ]}
                              onReady={handleGraphReady}
                            />
                          )}
                        </div>
                      </>
                    )}
                    {(vuln?.vulnerabilityPath.length || 0) === 0 && (
                      <div className="mt-4">
                        <Callout intent="warning" showIcon>
                          There are more than 12 different paths which lead to
                          this vulnerability in your dependency tree. Therefore
                          the graph is not displayed by default to avoid
                          performance issues.
                          {isMember(role)
                            ? " You can still mark this vulnerability as false positive or accept the risk using the buttons below."
                            : ""}
                        </Callout>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {vuln ? (
                <div className="mt-10">
                  <RiskAssessmentFeed
                    vulnerabilityName={vuln.cveID ?? ""}
                    events={vuln.events}
                    deleteEvent={handleDeleteEvent}
                    page="dependency-risks"
                    directDependencyFixedVersion={
                      vuln.directDependencyFixedVersion
                    }
                  />
                  {vuln && <Quickfix vuln={vuln} />}
                  {(isMember(role) || vuln.ticketUrl) && (
                    <div data-tour="vuln-management">
                      <Card>
                        <CardContent className="mt-4">
                          <AuthGuard require="member">
                            <>
                              {vuln.state === "open" ? (
                                <form
                                  className="flex flex-col gap-4"
                                  onSubmit={(e) => e.preventDefault()}
                                >
                                  <div className="flex flex-row justify-end gap-1">
                                    <div className="flex flex-row items-start gap-2 pt-2">
                                      {vuln.ticketId === null &&
                                        (integrationName === undefined ? (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <span>
                                                <Button
                                                  variant={"ghost"}
                                                  disabled
                                                  className=""
                                                >
                                                  <span className="ml-1 text-muted-foreground">
                                                    Create Ticket
                                                  </span>
                                                </Button>
                                              </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              No repository is linked. To create
                                              a ticket, please integrate your
                                              issue tracker in the {` `}
                                              <Link
                                                href={`/${activeOrg.slug}/projects/${projectSlug}/assets/${assetSlug}/settings`}
                                                className="underline"
                                              >
                                                settings
                                              </Link>
                                            </TooltipContent>
                                          </Tooltip>
                                        ) : (
                                          <Button
                                            variant={"secondary"}
                                            onClick={() =>
                                              setMitigateDialogOpen(true)
                                            }
                                          >
                                            {integrationName === "gitlab" && (
                                              <GitProviderIcon
                                                externalEntityProviderIdOrRepositoryId={
                                                  asset.externalEntityProviderId ??
                                                  "gitlab"
                                                }
                                              />
                                            )}
                                            {integrationName === "github" && (
                                              <Image
                                                alt="GitHub Logo"
                                                width={15}
                                                height={15}
                                                className="dark:invert"
                                                src={"/assets/github.svg"}
                                              />
                                            )}
                                            {integrationName === "jira" && (
                                              <Image
                                                alt="Jira Logo"
                                                width={15}
                                                height={15}
                                                src={
                                                  "/assets/jira-svgrepo-com.svg"
                                                }
                                              />
                                            )}
                                            <span className="ml-1">
                                              Create Ticket{" "}
                                            </span>
                                          </Button>
                                        ))}

                                      <Button
                                        data-testid="mark-false-positive"
                                        onClick={() =>
                                          setFalsePositiveDialogOpen(true)
                                        }
                                        variant={"secondary"}
                                      >
                                        Mark as False Positive
                                      </Button>
                                      <Button
                                        data-testid="mark-accepted-risk"
                                        onClick={() =>
                                          setAcceptRiskDialogOpen(true)
                                        }
                                        variant={"secondary"}
                                      >
                                        Accept risk
                                      </Button>
                                      <Button
                                        data-testid="add-comment"
                                        onClick={() =>
                                          setCommentDialogOpen(true)
                                        }
                                        variant={"default"}
                                      >
                                        Comment
                                      </Button>
                                    </div>
                                  </div>
                                </form>
                              ) : isLastEventVexRule ? (
                                <p className="text-sm text-muted-foreground">
                                  This vuln was handled by a VEX rule. Remove or
                                  adjust the VEX rule to reopen it.
                                </p>
                              ) : (
                                <form
                                  className="flex flex-col gap-4"
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                  }}
                                >
                                  <div>
                                    <label className="mb-2 block text-sm font-semibold">
                                      Comment
                                    </label>
                                    <MarkdownEditor
                                      value={justification ?? ""}
                                      setValue={setJustification}
                                      placeholder="Add your comment here..."
                                    />
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    You can reopen this vuln, if you plan to
                                    mitigate the risk now, or accepted this vuln
                                    by accident.
                                  </p>
                                  <div className="flex flex-row justify-end">
                                    <AsyncButton
                                      onClick={() =>
                                        handleSubmit({
                                          status: "reopened",
                                          justification,
                                        })
                                      }
                                      variant={"secondary"}
                                      type="submit"
                                    >
                                      Reopen
                                    </AsyncButton>
                                  </div>
                                </form>
                              )}
                            </>
                          </AuthGuard>

                          {vuln.ticketUrl && (
                            <small className="mt-2 block w-full text-right text-muted-foreground">
                              Comment will be synced with{" "}
                              <Link href={vuln.ticketUrl} target="_blank">
                                {vuln.ticketUrl}
                              </Link>
                            </small>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <RiskAssessmentFeedSkeleton />
                  <div>
                    <EditorSkeleton />
                  </div>
                </>
              )}
            </div>
            {vuln ? (
              <div className="border-l">
                <div data-tour="risk-score with details">
                  <div>
                    <RiskSeverityRadialChart
                      risk={vuln.rawRiskAssessment}
                      cvss={vuln.cve?.risk.baseScore ?? 0}
                    />
                  </div>
                  {vuln.cve?.euvdExploitAdd || vuln.cve?.cisaExploitAdd ? (
                    <div className="p-5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Callout intent="danger">
                              <p className="font-medium mx-2">
                                This vulnerability is known to be actively
                                exploited!
                              </p>
                              <div className="mt-1 mx-2 space-y-0.5">
                                {vuln.cve?.euvdExploitAdd && (
                                  <div className="flex justify-between gap-4">
                                    <span>EUVD:</span>
                                    <span>
                                      {formatDate(vuln.cve.euvdExploitAdd)}
                                    </span>
                                  </div>
                                )}
                                {vuln.cve?.cisaExploitAdd && (
                                  <div className="flex justify-between gap-4">
                                    <span>CISA:</span>
                                    <span>
                                      {formatDate(vuln.cve.cisaExploitAdd)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </Callout>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-screen-sm font-normal">
                          <p>
                            A KEV catalog flags this vulnerability as one that
                            has already been actively exploited by attackers.
                            Below you can see the KEV source and the date the
                            information was added.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  ) : (
                    <></>
                  )}
                  <DetailedRiskAssessment vuln={vuln} asset={asset} />
                </div>
                <div data-tour="affected-component">
                  <AffectedComponentDetails vuln={vuln} />
                </div>

                <div className="p-5">
                  <h3 className="mb-2 text-sm font-semibold">
                    Management decisions across the organization
                  </h3>
                  {hints ? (
                    <div className="flex flex-row justify-between mt-4">
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant={"secondary"}>
                            <Bug className="-ml-1 mr-1 inline-block h-4 w-4" />
                            {hints.amountOpen}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-screen-sm font-normal">
                          This vulnerability is still open in {hints.amountOpen}{" "}
                          projects, artifacts and assets.
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant={"secondary"}>
                            <CheckCircleIcon className="-ml-1 mr-1 inline-block h-4 w-4" />
                            {hints.amountFixed}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-screen-sm font-normal">
                          This vulnerability has been fixed in{" "}
                          {hints.amountFixed} projects, artifacts and assets.
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant={"secondary"}>
                            <SpeakerXMarkIcon className="-ml-1 mr-1 inline-block h-4 w-4" />
                            {hints.amountAccepted}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-screen-sm font-normal">
                          This vulnerability has been accepted in{" "}
                          {hints.amountAccepted} projects, artifacts and assets.
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant={"secondary"}>
                            <StopIcon className="-ml-1 mr-1 inline-block h-4 w-4" />
                            {hints.amountFalsePositive}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-screen-sm font-normal">
                          This vulnerability has been marked as false positive
                          in {hints.amountFalsePositive} projects, artifacts and
                          assets.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  ) : (
                    <Skeleton className="w-full h-20" />
                  )}
                </div>
              </div>
            ) : (
              <div className="border-l flex-col pl-4 flex gap-8">
                <Skeleton className="w-full h-[250px]" />
                <Skeleton className="w-full h-20" />
                <Skeleton className="w-full h-[250px]" />
                <Skeleton className="w-full h-[250px]" />
                <Skeleton className="w-full h-[250px]" />
                <Skeleton className="w-full h-[250px]" />
              </div>
            )}
          </div>
        </div>
      </div>
      <CommentDialog
        open={commentDialogOpen}
        onOpenChange={setCommentDialogOpen}
        onSubmit={async (justification) => {
          return handleSubmit({
            status: "comment",
            justification,
          });
        }}
      />
      <MitigateDialog
        open={mitigateDialogOpen}
        onOpenChange={setMitigateDialogOpen}
        onSubmit={async (justification) => {
          return handleSubmit({
            status: "mitigate",
            justification,
          });
        }}
        integrationType={integrationName ?? undefined}
        gitlabIntegration={asset.externalEntityProviderId ?? "gitlab"}
      />

      <AcceptRiskDialog
        open={acceptRiskDialogOpen}
        onOpenChange={setAcceptRiskDialogOpen}
        onSubmit={async (justification) => {
          return handleSubmit({
            status: "accepted",
            justification,
          });
        }}
      />

      <FalsePositiveDialog
        open={falsePositiveDialogOpen}
        onOpenChange={setFalsePositiveDialogOpen}
        onSubmit={async (data) => {
          return handleSubmit({
            status: "falsePositive",
            justification: data.justification,
            mechanicalJustification: data.mechanicalJustification,
            pathPattern: data.pathPattern,
          });
        }}
        pathPatternOptions={
          vuln?.vulnerabilityPath.length === 0 ? [] : pathPatternOptions
        }
        vulnState={vuln?.state ?? ""}
        vexRulesUrl={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/refs/${assetVersion?.slug}/vex-rules`}
      />
      <AcceptVexRuleRecommendationDialog
        vexRule={selectedVexRule}
        isOpen={acceptVexRuleRecommendationDialogOpen}
        onOpenChange={setAcceptVexRuleRecommendationDialogOpen}
        organizationSlug={organizationSlug}
        projectSlug={projectSlug}
        assetSlug={assetSlug}
        assetVersionSlug={assetVersionSlug}
        urlBase={`/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/vex-rules`}
        onAccepted={() => {
          mutate();
        }}
      />
      <VexRuleDetailsDialog
        vexRule={selectedVexRule}
        isOpen={vexRuleDialogOpen}
        onOpenChange={setVexRuleDialogOpen}
        urlBase={`/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/vex-rules`}
        onDeleted={() => {
          mutate();
        }}
      />
    </Page>
  );
};

export default Index;
