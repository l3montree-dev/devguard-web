"use client";

import Page from "@/components/Page";
import RiskSeverityRadialChart from "@/components/RiskSeverityRadialChart";
import AssetTitle from "@/components/common/AssetTitle";
import MitigateDialog from "@/components/MitigateDialog";
import VulnState from "@/components/common/VulnState";
import { dependencyRiskTourSteps } from "@/components/common/tours/dependency-risk-tour";
import DetailedRiskAssessment from "@/components/risk-assessment/DetailedRiskAssessment";
import ManagementDecisions from "@/components/risk-assessment/ManagementDecisions";
import RiskAssessmentFeed from "@/components/risk-assessment/RiskAssessmentFeed";
import VulnAssessmentComposer from "@/components/risk-assessment/VulnAssessmentComposer";
import PathToComponent from "@/components/risk-handling/PathToComponent";
import RelationCard from "@/components/risk-handling/RelationCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AddVexRuleDialog from "@/components/vex-rules/AddVexRuleDialog";
import { buildPathPatternRule } from "@/components/vex-rules/vexRuleParser";
import VexRuleCard from "@/components/vex-rules/VexRuleCard";
import VexRuleRecommendationCard from "@/components/vex-rules/VexRuleRecommendationCard";
import {
  crowdsourcedVexingUrl,
  useVexRuleRecommendation,
} from "@/components/vex-rules/useVexRuleRecommendations";
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
  DetailedDependencyVulnDTO,
  VexRulePrefill,
  VulnEventDTO,
} from "@/types/api/api";
import { formatDate } from "@/utils/format";
import { beautifyPurl } from "@/utils/common";
import { getIntegrationNameFromRepositoryIdOrExternalProviderId } from "@/utils/view";
import { Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { FunctionComponent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import AffectedComponentDetails from "../../../../../../../../../../../components/AffectedComponent";
import ArtifactBadge from "../../../../../../../../../../../components/ArtifactBadge";
import GitProviderIcon from "../../../../../../../../../../../components/GitProviderIcon";
import Quickfix from "../../../../../../../../../../../components/Quickfix";
import Callout from "../../../../../../../../../../../components/common/Callout";
import Err from "../../../../../../../../../../../components/common/Err";
import Markdown from "../../../../../../../../../../../components/common/Markdown";
import EditorSkeleton from "../../../../../../../../../../../components/risk-assessment/EditorSkeleton";
import RiskAssessmentFeedSkeleton from "../../../../../../../../../../../components/risk-assessment/RiskAssessmentFeedSkeleton";
import { Skeleton } from "../../../../../../../../../../../components/ui/skeleton";
import { fetcher } from "../../../../../../../../../../../data-fetcher/fetcher";
import { useActiveAssetVersion } from "../../../../../../../../../../../hooks/useActiveAssetVersion";
import useDecodedParams from "../../../../../../../../../../../hooks/useDecodedParams";

// Renders nothing unless a ticket can actually be created — that needs a linked
// issue tracker and a vulnerability that doesn't have a ticket yet.
const CreateTicketButton: FunctionComponent<{
  integrationName: "gitlab" | "github" | "jira" | undefined;
  hasTicket: boolean;
  externalEntityProviderId?: string;
  onClick: () => void;
}> = ({ integrationName, hasTicket, externalEntityProviderId, onClick }) => {
  if (integrationName === undefined || hasTicket) return null;

  return (
    <Button variant="secondary" onClick={onClick}>
      {integrationName === "gitlab" && (
        <GitProviderIcon
          externalEntityProviderIdOrRepositoryId={
            externalEntityProviderId ?? "gitlab"
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
          src={"/assets/jira-svgrepo-com.svg"}
        />
      )}
      <span className="ml-1">Create Ticket</span>
    </Button>
  );
};

const Index: FunctionComponent = () => {
  const role = useCurrentUserRole();

  const activeOrg = useActiveOrg();
  const project = useActiveProject()!;

  const assetMenu = useAssetMenu();
  const asset = useActiveAsset()!;
  const assetVersion = useActiveAssetVersion();

  const deleteEvent = useDeleteEvent();
  const currentUser = useCurrentUser();

  const [addVexRuleDialogOpen, setAddVexRuleDialogOpen] = useState(false);
  const [mitigateDialogOpen, setMitigateDialogOpen] = useState(false);
  const [vexRulePrefill, setVexRulePrefill] = useState<VexRulePrefill>();
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const searchParams = useSearchParams();
  const { startTour, registerSteps } = usePageTour(dependencyRiskTourSteps);
  const { showModal: shouldStartTour, markSeen } =
    useTourSeen("dependency-risk");

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

  // What other DevGuard organizations already decided about this vulnerability.
  const { recommendation } = useVexRuleRecommendation(
    crowdsourcedVexingUrl({
      organizationSlug,
      projectSlug,
      assetSlug,
    }),
    vulnId,
  );

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

  // The VEX rule currently holding this vuln, if the last decisive event was
  // created by one (and the backend attached the rule object to that event).
  const lockingVexRule = useMemo(() => {
    if (!vuln?.events?.length) return null;
    for (let i = vuln.events.length - 1; i >= 0; i--) {
      const ev = vuln.events[i];
      if (ev.type === "rawRiskAssessmentUpdated") continue;
      return ev.createdByVexRule ? (ev.vexRule ?? null) : null;
    }
    return null;
  }, [vuln]);

  // Locked = handled (accepted / false positive) and owned by a VEX rule.
  const isVexLocked =
    isLastEventVexRule &&
    (vuln?.state === "accepted" || vuln?.state === "falsePositive");
  //
  const lockedOverlay = isVexLocked
    ? " pointer-events-none select-none blur-[1px] opacity-50 transition"
    : "";

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

  // The path is rendered as static boxes (no React Flow), so there is no graph
  // onReady callback — start the tour directly once the path view is ready.
  useEffect(() => {
    if (!graphLoading && (vuln?.vulnerabilityPath.length || 0) > 0) {
      handleGraphReady();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphLoading, vuln, shouldStartTour]);

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
                  <>
                    <VulnState state={vuln?.state ?? "open"} />
                    {isVexLocked && (
                      <Badge
                        variant="default"
                        className="gap-1 py-1"
                        title="A VEX rule is handling this vulnerability. Delete the rule to reopen it."
                      >
                        <Lock className="h-4 w-4" />
                        Locked by VEX rule
                      </Badge>
                    )}
                  </>
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
                {!!vuln?.artifacts.length && (
                  <div className="flex flex-row flex-wrap items-center gap-2">
                    <span className="text-muted-foreground">Artifacts:</span>
                    {vuln.artifacts.map((a) => (
                      <ArtifactBadge
                        key={a.artifactName + vuln.id}
                        artifactName={a.artifactName}
                      />
                    ))}
                  </div>
                )}
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
                        className="text-sm text-link hover:opacity-80 my-2 cursor-pointer"
                      >
                        {descriptionExpanded ? "Show less" : "Read more"}
                      </button>
                    )}
                  </>
                ) : (
                  <Skeleton className="w-full h-20" />
                )}
              </div>
              {isVexLocked && lockingVexRule && (
                <div className="mt-6">
                  <VexRuleCard
                    vexRule={lockingVexRule}
                    vexRulesUrl={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/vex-rules`}
                  />
                </div>
              )}
              {/* Only worth offering while nothing handles this vuln yet. */}
              {!isVexLocked && recommendation && isMember(role) && (
                <div className="mt-6">
                  <VexRuleRecommendationCard
                    recommendation={recommendation}
                    onCreateRule={() => {
                      setVexRulePrefill({
                        title: `${vuln?.cveID ?? "Vulnerability"} assessed as not exploitable`,
                        celExpression: recommendation.celExpression,
                        justification: recommendation.justification,
                        mechanicalJustification:
                          recommendation.mechanicalJustification,
                        wasRecommended: true,
                      });
                      setAddVexRuleDialogOpen(true);
                    }}
                  />
                </div>
              )}
              <div className={lockedOverlay}>
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
                      {vuln && vuln.vulnerabilityPath.length > 0 && (
                        <PathToComponent
                          rootName={asset.name}
                          path={vuln.vulnerabilityPath}
                          pathCount={graphResponse?.length}
                          actionable={vuln.state === "open" && isMember(role)}
                          onCallClick={(edgeIndex) => {
                            const suffix =
                              vuln.vulnerabilityPath.slice(edgeIndex);
                            setVexRulePrefill({
                              title: `${vuln.cveID ?? "Vulnerability"} not exploitable in ${beautifyPurl(
                                suffix[0] ?? vuln.componentPurl,
                              )}`,
                              celExpression: buildPathPatternRule(
                                vuln.vulnerabilityPath,
                                edgeIndex,
                                vuln.cveID,
                              ),
                            });
                            setAddVexRuleDialogOpen(true);
                          }}
                        />
                      )}
                      {(vuln?.vulnerabilityPath.length || 0) === 0 && (
                        <div className="mt-4">
                          <Callout intent="warning" showIcon>
                            There are more than 12 different paths which lead to
                            this vulnerability in your dependency tree.
                            Therefore the graph is not displayed by default to
                            avoid performance issues.
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
                        <VulnAssessmentComposer
                          state={vuln.state ?? "open"}
                          isHandledByVexRule={isLastEventVexRule}
                          ticketUrl={vuln.ticketUrl}
                          onCreateVexRule={() => {
                            setVexRulePrefill(undefined);
                            setAddVexRuleDialogOpen(true);
                          }}
                          onSubmit={handleSubmit}
                          secondaryActions={
                            <CreateTicketButton
                              integrationName={integrationName}
                              hasTicket={vuln.ticketId != null}
                              externalEntityProviderId={
                                asset.externalEntityProviderId
                              }
                              onClick={() => setMitigateDialogOpen(true)}
                            />
                          }
                        />
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
      <AddVexRuleDialog
        open={addVexRuleDialogOpen}
        onOpenChange={setAddVexRuleDialogOpen}
        baseUrl={`/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/vex-rules`}
        onCreated={() => mutate()}
        prefill={vexRulePrefill}
        // A prefilled expression means the effect matters more than the editor.
        variant={vexRulePrefill ? "reduced" : "full"}
        currentVuln={
          vuln
            ? {
                cveID: vuln.cveID,
                componentPurl: vuln.componentPurl,
                vulnerabilityPath: vuln.vulnerabilityPath,
                rootName: asset.name,
              }
            : undefined
        }
      />
    </Page>
  );
};

export default Index;
