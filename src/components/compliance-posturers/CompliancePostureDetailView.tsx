// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Page from "@/components/Page";

import type { PostureScope } from "@/services/compliancePostureService";
import {
  createPostureEvent,
  deleteStatement,
} from "@/services/compliancePostureService";
import {
  useComplianceComponentsForControl,
  useCompliancePosture,
} from "@/hooks/useCompliancePosture";
import type {
  DetailedComplianceRiskDTO,
  VulnEventDTO,
} from "@/types/view/vulnEvents";
import type { AssetDTO, AssetVersionDTO, ProjectDTO } from "@/types/dto";

import Image from "next/image";

import AuthGuard from "@/components/AuthGuard";
import ListItem from "@/components/common/ListItem";
import AddComplianceComponentStatementDialog from "@/components/compliance-posturers/AddComplianceComponentStatementDialog";
import ComplianceComponentIcon from "@/components/compliance-posturers/ComplianceComponentIcon";
import { TokenizedText } from "@/components/compliance-posturers/TokenizedText";
import RiskAssessmentFeed from "@/components/risk-assessment/RiskAssessmentFeed";
import { AsyncButton, Button } from "@/components/ui/button";
import { useSession } from "@/context/SessionContext";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveProject } from "@/hooks/useActiveProject";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";

import type {
  BadgeVariant,
  ControlRelationship,
} from "@/types/view/compliance";

function securityLevelVariant(value: string): BadgeVariant {
  if (value === "erhöht") return "MEDIUM";
  return "LOW";
}

function effortLevelVariant(value: string | number): BadgeVariant {
  const n = Number(value);
  if (n <= 1) return "LOW";
  if (n <= 3) return "MEDIUM";
  return "CRITICAL";
}

export function importanceVariant(value: string): BadgeVariant {
  const lower = value.toLowerCase();
  if (lower === "muss") return "CRITICAL";
  if (lower === "sollte") return "MEDIUM";
  // check if we can parse it as a number
  const n = Number(value);
  if (!isNaN(n)) {
    if (n <= 3) return "LOW";
    if (n <= 6) return "MEDIUM";
    if (n < 9) return "HIGH";
    return "CRITICAL";
  }
  return "LOW";
}

export function implementationStatusVariant(value: string): BadgeVariant {
  const lower = value.toLowerCase();
  if (lower === "implemented") return "LOW";
  if (lower === "partial") return "MEDIUM";
  if (lower === "planned") return "MEDIUM";
  if (lower === "alternative") return "MEDIUM";
  if (lower === "not applicable") return "LOW";
  return "LOW";
}

import Err from "@/components/common/Err";
import VulnState from "@/components/common/VulnState";
import GitProviderIcon from "@/components/GitProviderIcon";
import EditorSkeleton from "@/components/risk-assessment/EditorSkeleton";
import RiskAssessmentFeedSkeleton from "@/components/risk-assessment/RiskAssessmentFeedSkeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useActiveAssetVersion } from "@/hooks/useActiveAssetVersion";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useDeleteEvent } from "@/hooks/useDeleteEvent";
import { getIntegrationNameFromRepositoryIdOrExternalProviderId } from "@/utils/view";
import { ChevronRightIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import FrameworkIcon from "./FrameworkIcon";
import {
  EquivalentToIcon,
  IntersectsWithIcon,
  SubsetOfIcon,
  SupersetOfIcon,
} from "./SetRelationshipIcons";

import useDecodedParams from "@/hooks/useDecodedParams";
import Callout from "../common/Callout";
import { FlatBadge } from "../common/Severity";

const MarkdownEditor = dynamic(
  () => import("@/components/common/MarkdownEditor"),
  { ssr: false },
);

const relationshipDescription: Record<ControlRelationship, string> = {
  "equivalent-to": "This control is equivalent to the related control.",
  "intersects-with":
    "This control partially overlaps with the related control.",
  "subset-of": "This control is a subset of the related control.",
  "superset-of": "This control is a superset of the related control.",
};

function RelationshipIcon({
  relationship,
}: {
  relationship: ControlRelationship;
}) {
  const className = "h-4 w-4";
  switch (relationship) {
    case "equivalent-to":
      return <EquivalentToIcon className={className} />;
    case "intersects-with":
      return <IntersectsWithIcon className={className} />;
    case "subset-of":
      return <SubsetOfIcon className={className} />;
    case "superset-of":
      return <SupersetOfIcon className={className} />;
    default:
      return null;
  }
}

function MappedControlsGroup({
  framework,
  controls,
}: {
  framework: string;
  controls: { relatedControlId: string; relationship: ControlRelationship }[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "";
  const basePath = pathname.substring(0, pathname.lastIndexOf("/"));
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mb-2 w-full">
      <CollapsibleTrigger className="flex items-center gap-1 text-sm font-medium hover:underline">
        <ChevronRightIcon
          className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`}
        />

        <span className="text-start">{framework}</span>
        <span className="ml-1 text-xs text-muted-foreground whitespace-nowrap">
          ({controls.length})
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 flex flex-wrap">
        {controls.map(({ relatedControlId, relationship }) => (
          <Tooltip key={relatedControlId}>
            <TooltipTrigger asChild>
              {framework === "Grundschutz" ? (
                <Badge
                  variant="secondary"
                  className="mr-2 mb-2 flex cursor-default items-center gap-1"
                >
                  <RelationshipIcon relationship={relationship} />
                  {relatedControlId}
                </Badge>
              ) : (
                <Link href={`${basePath}/${framework}:${relatedControlId}`}>
                  <Badge
                    variant="secondary"
                    className="mr-2 mb-2 flex cursor-default items-center gap-1"
                  >
                    <RelationshipIcon relationship={relationship} />
                    {relatedControlId}
                  </Badge>
                </Link>
              )}
            </TooltipTrigger>
            <TooltipContent>
              {relationshipDescription[relationship]}
            </TooltipContent>
          </Tooltip>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

interface Props {
  scope: PostureScope;
  vulnId: string;
  Menu?: any[];
  Title?: ReactNode;
  showTicketCreation?: boolean;
}

const isInherited = (
  vuln: DetailedComplianceRiskDTO | undefined,
  assetVersionName: AssetVersionDTO | undefined,
  asset: AssetDTO | undefined,
  project: ProjectDTO | undefined,
) => {
  if (!vuln) return false;

  return (
    (assetVersionName != null &&
      asset != null &&
      !vuln.assetVersionName &&
      !vuln.assetId &&
      vuln.events.length > 0) ||
    (project != null && !vuln.projectId && vuln.events.length > 0)
  );
};

const InheritedHandlingWarning = (
  vuln: DetailedComplianceRiskDTO,
  assetVersionName: AssetVersionDTO | undefined,
  asset: AssetDTO | undefined,
  project: ProjectDTO | undefined,
) => {
  if (
    assetVersionName != null &&
    asset != null &&
    !vuln.assetVersionName &&
    !vuln.assetId &&
    vuln.events.length > 0
  )
    return (
      <div className="mt-4">
        <Callout intent="warning">
          This compliance posture was handled at a higher level (project or
          organization) and has been inherited here. Any changes you make will
          only apply to this asset and all its children, and will not affect the
          original handling at the higher level.
        </Callout>
      </div>
    );
  if (project != null && !vuln.projectId && vuln.events.length > 0)
    return (
      <div className="mt-4">
        <Callout intent="warning">
          This compliance posture was handled at the organization level and has
          been inherited here. Any changes you make will only apply to this
          project and all its children, and will not affect the
          organization-level handling.
        </Callout>
      </div>
    );
};

const CompliancePostureDetailView = ({ scope, vulnId, Menu, Title }: Props) => {
  const {
    data: vuln,
    error,
    isLoading,
    mutate,
  } = useCompliancePosture(scope, vulnId);

  const { data: availableComponents } = useComplianceComponentsForControl(
    vuln?.frameworkControlId,
  );

  const attachedComponentIds = useMemo(
    () => (vuln?.byComponents ?? []).map((s) => s.complianceComponentId),
    [vuln?.byComponents],
  );

  const hasAttachableComponents = useMemo(
    () =>
      (availableComponents ?? []).some(
        (c) => !attachedComponentIds.includes(c.uuid),
      ),
    [availableComponents, attachedComponentIds],
  );

  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();
  const assetVersion = useActiveAssetVersion();
  const { session } = useSession();
  const params = useDecodedParams();
  const { assetSlug, projectSlug } = params;

  const inherited = isInherited(vuln, assetVersion, asset, project);

  const [justification, setJustification] = useState<string | undefined>(
    undefined,
  );
  const deleteEvent = useDeleteEvent();
  const [showAddComponent, setShowAddComponent] = useState(false);

  const handleDeleteStatement = async (statementId: string) => {
    const removedStatement = vuln?.byComponents.find(
      (s) => s.id === statementId,
    );

    try {
      await deleteStatement(scope, statementId);
    } catch {
      toast("Failed to remove component", {
        description: "Please try again later.",
      });
      return;
    }

    if (inherited) {
      // the posture we'd patch locally may be a different record than the
      // one the server just created/updated at this scope - skip the
      // optimistic patch entirely and just refetch.
      mutate();
      return;
    }

    const optimisticEvent = {
      type: "removedComplianceComponent",
      id: "optimistic-" + statementId,
      createdAt: new Date().toISOString(),
      justification: "",
      mechanicalJustification: "",
      userId: session?.identity.id ?? "",
      vulnType: "compliancePosture",
      originalAssetVersionName: assetVersion?.name ?? "",
      arbitraryJSONData: {
        componentTitle: removedStatement?.complianceComponentTitle ?? "",
      },
    } as VulnEventDTO;

    mutate(
      (current) =>
        current
          ? {
              ...current,
              byComponents: current.byComponents.filter(
                (s) => s.id !== statementId,
              ),
              events: [...(current.events ?? []), optimisticEvent],
            }
          : current,
      { revalidate: false },
    );
  };

  const integrationName = useMemo(
    () =>
      getIntegrationNameFromRepositoryIdOrExternalProviderId(asset, project),
    [asset, project],
  );

  if (isLoading || !vuln) {
    return (
      <Page title="Loading...">
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3">
            <Skeleton className="w-64 h-10" />
            <Skeleton className="w-full mt-4 h-20" />
            <div className="mt-4 flex flex-row gap-2">
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-20 h-4" />
            </div>
            <Skeleton className="w-full mt-10 mb-16 h-[200px]" />
            <RiskAssessmentFeedSkeleton />
            <div>
              <EditorSkeleton />
            </div>
          </div>
          <div className="border-l col-span-1 flex-col pl-4">
            <Skeleton className="w-full h-[200px]" />
          </div>
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Error Loading Vulnerability">
        <Err />
      </Page>
    );
  }

  const handleSubmit = async (data: {
    status?: VulnEventDTO["type"];
    justification?: string;
    mechanicalJustification?: string;
  }) => {
    if (data.status === undefined) {
      return;
    }

    if (!Boolean(data.justification)) {
      return toast("Please provide a justification", {
        description: "You need to provide a justification for your decision.",
      });
    }

    const optimisticState =
      data.status === "implemented"
        ? "implemented"
        : data.status === "notApplicable"
          ? "notApplicable"
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
            userId: session?.identity.id ?? "",
            vulnType: "compliancePosture",
            originalAssetVersionName: assetVersion?.name ?? "",
          } as VulnEventDTO)
        : undefined;

    const mutatePromise = mutate(
      async (current) => {
        const json = (await createPostureEvent(
          scope,
          vuln.frameworkControlId,
          data,
        )) as unknown as DetailedComplianceRiskDTO;

        if (!json.events) {
          toast("Failed to update vulnerability", {
            description: "Please try again later.",
          });
          throw new Error("Failed to update vulnerability");
        }

        return {
          ...current!,
          ...json,
          events: current!.events.concat([json.events.slice(-1)[0]]),
        };
      },
      {
        // when inherited, the update targets a new posture at this scope
        // (not the parent record we're currently displaying) - showing an
        // optimistic patch of the parent's state/events would be
        // misleading, so just wait for the real server response.
        optimisticData:
          !inherited && optimisticState
            ? {
                ...vuln,
                state: optimisticState,
                events: (vuln.events ?? []).concat(
                  optimisticEvent ? [optimisticEvent] : [],
                ),
              }
            : undefined,
        rollbackOnError: true,
        revalidate: false,
      },
    );

    if (optimisticState !== undefined) {
      mutatePromise
        .then(() =>
          toast("Saved", { description: "Changes confirmed by server." }),
        )
        .catch(() => {});
      setJustification("");
      return true;
    }

    await mutatePromise;
    setJustification("");
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
    mutate();
  };
  return (
    <Page Menu={Menu} Title={Title} title={vuln.title}>
      <div className="flex flex-row gap-4">
        <div className="flex-1">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <div className="flex flex-row items-start justify-between gap-4">
                <h1 className="text-2xl font-semibold">{vuln.title}</h1>
              </div>
              <div className="mt-4 text-muted-foreground">
                <TokenizedText
                  text={vuln.description?.replaceAll("\n", "\n\n") ?? ""}
                  definitions={
                    vuln.additional?.word_definition?.definitions ?? {}
                  }
                />
              </div>
              {vuln.additional?.guidance && (
                <div className="mt-4 text-muted-foreground">
                  <p className="mb-1 font-semibold">Guidance</p>
                  <TokenizedText
                    text={vuln.additional.guidance}
                    definitions={
                      vuln.additional?.word_definition?.definitions ?? {}
                    }
                  />
                </div>
              )}
              {vuln.additional?.assessment_objective && (
                <div className="mt-4 text-muted-foreground">
                  <p className="mt-4 mb-1 font-semibold">
                    Assessment Objective
                  </p>
                  {vuln.additional.assessment_objective.map(
                    (obj: any, index: number) => (
                      <div key={index} className="mt-4 text-muted-foreground">
                        <p className="mb-1 font-semibold">{obj?.id}</p>
                        <TokenizedText text={obj?.prose} />
                      </div>
                    ),
                  )}
                </div>
              )}
              <div className="mt-4 flex flex-row flex-wrap gap-2 text-sm mb-4">
                {vuln.ticketUrl && (
                  <Link href={vuln.ticketUrl} target="_blank">
                    <Badge className="h-full" variant={"secondary"}>
                      {vuln.ticketId?.startsWith("github:") ? (
                        <Image
                          src="/assets/github.svg"
                          alt="GitHub Logo"
                          className="-ml-1 mr-2 dark:invert"
                          width={15}
                          height={15}
                        />
                      ) : (
                        <div className="mr-2">
                          <GitProviderIcon
                            externalEntityProviderIdOrRepositoryId={
                              asset?.externalEntityProviderId ??
                              asset?.repositoryId ??
                              "gitlab"
                            }
                          />
                        </div>
                      )}
                      <span>{vuln.ticketUrl}</span>
                    </Badge>
                  </Link>
                )}
                <VulnState state={vuln.state} />
                <Badge key={vuln.framework} variant={"secondary"}>
                  {vuln.framework}
                </Badge>
              </div>

              {availableComponents && availableComponents.length > 0 && (
                <>
                  <div className="my-8">
                    {hasAttachableComponents && (
                      <ListItem
                        Button={
                          <AuthGuard require="member">
                            <Button
                              variant="secondary"
                              onClick={() => setShowAddComponent(true)}
                            >
                              Attach Component
                            </Button>
                          </AuthGuard>
                        }
                        Description={
                          <div>
                            <span>
                              Components you are using that implement this
                              control, and their implementation status.
                            </span>

                            {
                              <div className="flex mt-2 flex-wrap gap-2">
                                {availableComponents.map((c) => {
                                  const claim = c.implementedControls.find(
                                    (ic) =>
                                      ic.frameworkControlId ===
                                      vuln.frameworkControlId,
                                  );
                                  return (
                                    <Tooltip key={c.uuid}>
                                      <TooltipTrigger asChild>
                                        <Badge
                                          variant="outline"
                                          className="flex cursor-help flex-row items-center gap-1.5"
                                        >
                                          <ComplianceComponentIcon
                                            title={c.title}
                                            className="h-3.5 -ml-1 w-3.5"
                                          />
                                          {c.title}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {claim?.description ?? c.description}
                                      </TooltipContent>
                                    </Tooltip>
                                  );
                                })}
                              </div>
                            }
                          </div>
                        }
                        Title="Components"
                      />
                    )}

                    {vuln.byComponents && vuln.byComponents.length > 0 && (
                      <div className="flex mt-2 flex-col gap-2">
                        {vuln.byComponents.map((statement) => {
                          const component = availableComponents.find(
                            (c) => c.uuid === statement.complianceComponentId,
                          );

                          const control = component?.implementedControls.find(
                            (ic) =>
                              ic.frameworkControlId === vuln.frameworkControlId,
                          );
                          if (!control || !component) return null;

                          return (
                            <ListItem
                              key={statement.id}
                              Title={
                                <span className="flex flex-row items-center gap-2">
                                  <ComplianceComponentIcon
                                    title={component?.title}
                                  />
                                  {component?.title}
                                  <FlatBadge
                                    variant={implementationStatusVariant(
                                      statement.implementationStatus,
                                    )}
                                  >
                                    {statement.implementationStatus.toUpperCase()}
                                  </FlatBadge>
                                </span>
                              }
                              Description={
                                <div>
                                  <span className="border-l-2 pl-2 block mb-4">
                                    {control.description}
                                  </span>
                                  <span className="text-foreground">
                                    {statement.description}
                                  </span>
                                </div>
                              }
                              Button={
                                <AuthGuard require="member">
                                  <AsyncButton
                                    variant="ghost"
                                    onClick={() =>
                                      handleDeleteStatement(statement.id)
                                    }
                                  >
                                    Remove
                                  </AsyncButton>
                                </AuthGuard>
                              }
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <AddComplianceComponentStatementDialog
                    open={showAddComponent}
                    setOpen={setShowAddComponent}
                    scope={scope}
                    frameworkControlId={vuln.frameworkControlId}
                    attachedComponentIds={(vuln.byComponents ?? []).map(
                      (s) => s.complianceComponentId,
                    )}
                    onCreated={(statement) => {
                      if (inherited) {
                        // the posture we'd patch locally may be a different
                        // record than the one the server just created at
                        // this scope - skip the optimistic patch entirely
                        // and just refetch.
                        mutate();
                        return;
                      }

                      const optimisticEvent = {
                        type: "attachedComplianceComponent",
                        id: "optimistic-" + statement.id,
                        createdAt: new Date().toISOString(),
                        justification: "",
                        mechanicalJustification: "",
                        userId: session?.identity.id ?? "",
                        vulnType: "compliancePosture",
                        originalAssetVersionName: assetVersion?.name ?? "",
                        arbitraryJSONData: {
                          componentTitle: statement.complianceComponentTitle,
                        },
                      } as VulnEventDTO;

                      mutate(
                        (current) =>
                          current
                            ? {
                                ...current,
                                byComponents: [
                                  ...(current.byComponents ?? []),
                                  statement,
                                ],
                                events: [
                                  ...(current.events ?? []),
                                  optimisticEvent,
                                ],
                              }
                            : current,
                        { revalidate: false },
                      );
                    }}
                  />
                </>
              )}
              {vuln.events && vuln.events.length > 0 && (
                <div className="mt-16">
                  <RiskAssessmentFeed
                    vulnerabilityName={vuln.frameworkControlId}
                    events={vuln.events}
                    page="compliance-posture"
                    deleteEvent={handleDeleteEvent}
                  />
                </div>
              )}
              <AuthGuard require="member">
                <div className="mt-10">
                  {vuln.state === "open" ? (
                    <form
                      className="flex flex-col gap-4"
                      onSubmit={(e) => e.preventDefault()}
                    >
                      <div>
                        <MarkdownEditor
                          placeholder="Add your comment here..."
                          value={justification ?? ""}
                          setValue={setJustification}
                        />
                      </div>

                      <div className="flex flex-row justify-end gap-1">
                        <div className="flex flex-row items-start gap-2">
                          {asset && (
                            <>
                              {/* we need to implement the endpoint in the backend to create a ticket for this case */}
                              {vuln.ticketId === null &&
                                integrationName === undefined &&
                                false && (
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
                                      No repository is linked. To create a
                                      ticket, please integrate your issue
                                      tracker in the{` `}
                                      <Link
                                        href={`/${activeOrg.slug}/projects/${projectSlug}/assets/${assetSlug}/settings`}
                                        className="underline"
                                      >
                                        settings
                                      </Link>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              {vuln.ticketId === null &&
                                integrationName === "gitlab" && (
                                  <AsyncButton
                                    variant={"secondary"}
                                    onClick={() =>
                                      handleSubmit({
                                        status: "mitigate",
                                        justification,
                                      })
                                    }
                                  >
                                    <div className="flex flex-col">
                                      <div className="flex">
                                        <GitProviderIcon
                                          externalEntityProviderIdOrRepositoryId={
                                            asset.externalEntityProviderId ??
                                            "gitlab"
                                          }
                                        />
                                        Create Ticket
                                      </div>
                                    </div>
                                  </AsyncButton>
                                )}
                              {vuln.ticketId === null &&
                                integrationName === "github" && (
                                  <AsyncButton
                                    variant={"secondary"}
                                    onClick={() =>
                                      handleSubmit({
                                        status: "mitigate",
                                        justification,
                                      })
                                    }
                                  >
                                    <div className="flex flex-col">
                                      <div className="flex">
                                        <Image
                                          alt="GitHub Logo"
                                          width={15}
                                          height={15}
                                          className="mr-2 dark:invert"
                                          src={"/assets/github.svg"}
                                        />
                                        Create GitHub Ticket
                                      </div>
                                    </div>
                                  </AsyncButton>
                                )}
                              {vuln.ticketId === null &&
                                integrationName === "jira" && (
                                  <AsyncButton
                                    variant={"secondary"}
                                    onClick={() =>
                                      handleSubmit({
                                        status: "mitigate",
                                        justification,
                                      })
                                    }
                                  >
                                    <div className="flex flex-col">
                                      <div className="flex">
                                        <Image
                                          alt="Jira Logo"
                                          width={15}
                                          height={15}
                                          className="mr-2"
                                          src={"/assets/jira-svgrepo-com.svg"}
                                        />
                                        Create Jira Ticket
                                      </div>
                                    </div>
                                  </AsyncButton>
                                )}
                            </>
                          )}
                          <AsyncButton
                            onClick={() =>
                              handleSubmit({
                                status: "implemented",
                                justification,
                              })
                            }
                            variant={"secondary"}
                          >
                            Implemented
                          </AsyncButton>
                          <AsyncButton
                            onClick={() =>
                              handleSubmit({
                                status: "notApplicable",
                                justification,
                              })
                            }
                            variant={"secondary"}
                          >
                            Not Applicable
                          </AsyncButton>
                          <AsyncButton
                            onClick={() =>
                              handleSubmit({
                                status: "comment",
                                justification,
                              })
                            }
                            variant={"default"}
                          >
                            Comment
                          </AsyncButton>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <form
                      className="flex flex-col gap-4"
                      onSubmit={(e) => e.preventDefault()}
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
                        You can mark this compliance posture as not implemented
                        if you made a mistake.
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
                  {vuln.ticketUrl && (
                    <small className="mt-2 block w-full text-right text-muted-foreground">
                      Comment will be synced with{" "}
                      <Link href={vuln.ticketUrl} target="_blank">
                        {vuln.ticketUrl}
                      </Link>
                    </small>
                  )}
                  <div>
                    {InheritedHandlingWarning(
                      vuln,
                      assetVersion,
                      asset,
                      project,
                    )}
                  </div>
                </div>
              </AuthGuard>
            </div>
            <div className="col-span-1 border-l p-4 pt-0">
              <h3 className="mb-4 text-sm font-semibold">Compliance Details</h3>

              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <FrameworkIcon
                    framework={vuln.framework}
                    className="h-10 w-10 shrink-0"
                  />
                  <div>
                    {vuln.framework && vuln.framework === "SCF" ? (
                      <Link
                        className="text-xs text-muted-foreground"
                        href="https://securecontrolsframework.com/"
                        target="_blank"
                      >
                        {vuln.framework} (CC-BY-ND-4.0)
                      </Link>
                    ) : vuln.framework && vuln.framework === "Grundschutz++" ? (
                      <Link
                        className="text-xs text-muted-foreground"
                        href="https://github.com/BSI-Bund/Stand-der-Technik-Bibliothek/tree/main/Anwenderkataloge/Grundschutz%2B%2B"
                        target="_blank"
                      >
                        {vuln.framework} (CC-BY-4.0)
                      </Link>
                    ) : vuln.framework && vuln.framework === "ISO27001" ? (
                      <Link
                        className="text-xs text-muted-foreground"
                        href="https://github.com/BSI-Bund/Stand-der-Technik-Bibliothek/blob/main/control_layer/ISO27001/ISO27001-AnnexA-catalog.json"
                        target="_blank"
                      >
                        {vuln.framework} (CC-BY-4.0)
                      </Link>
                    ) : vuln.framework &&
                      vuln.framework ===
                        "BSI-Anforderungen-zum-Risikomanagement" ? (
                      <Link
                        className="text-xs text-muted-foreground"
                        href="https://github.com/BSI-Bund/Stand-der-Technik-Bibliothek/blob/main/control_layer/Risikomanagement/BSI-Anforderungen-zum-Risikomanagement-catalog.json"
                        target="_blank"
                      >
                        {vuln.framework} (CC-BY-4.0)
                      </Link>
                    ) : vuln.framework &&
                      vuln.framework === "Lieferkettensicherheit" ? (
                      <Link
                        className="text-xs text-muted-foreground"
                        href="https://github.com/BSI-Bund/Stand-der-Technik-Bibliothek/blob/main/control_layer/Lieferkettensicherheit/Lieferkettensicherheit-resolved_catalog.json"
                        target="_blank"
                      >
                        {vuln.framework} (CC-BY-4.0)
                      </Link>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {vuln.framework}
                      </p>
                    )}
                    <p className="font-semibold">{vuln.controlId}</p>
                  </div>
                </div>

                <dl className="mt-4 flex flex-col gap-0 text-sm">
                  {vuln.additional?.group_title && (
                    <div className="flex flex-col items-start justify-between  border-t py-3 gap-2">
                      <dt className="text-xs text-muted-foreground">Group</dt>
                      <dd className="font-medium">
                        {vuln.additional.group_title}
                      </dd>
                    </div>
                  )}
                  {vuln.class && (
                    <div className="flex flex-col items-start justify-between border-t py-3 gap-2">
                      <dt className="text-xs text-muted-foreground">Class</dt>
                      <dd className="font-medium">{vuln.class}</dd>
                    </div>
                  )}
                  {vuln.additional?.security_level && (
                    <div className="flex flex-col items-start justify-between gap-2 border-t py-3">
                      <dt className="text-xs text-muted-foreground">
                        Security Level
                      </dt>
                      <dd>
                        <FlatBadge
                          variant={securityLevelVariant(
                            vuln.additional.security_level.value,
                          )}
                        >
                          {/* Currently the links in the Grundschutz++ catalog are wrong, so we don't want to link them here — we can remove this condition once the report gets updated */}
                          {vuln.additional.security_level.ns &&
                          vuln.framework !== "Grundschutz++" ? (
                            <Link
                              href={vuln.additional.security_level.ns}
                              target="_blank"
                              className="no-underline"
                              style={{ color: "inherit" }}
                            >
                              <TokenizedText
                                noUnderline
                                text={vuln.additional.security_level.value}
                                definitions={
                                  vuln.additional.security_level.definitions
                                }
                                split={false}
                              />
                            </Link>
                          ) : (
                            <TokenizedText
                              text={vuln.additional.security_level.value}
                              noUnderline
                              definitions={
                                vuln.additional.security_level.definitions
                              }
                              split={false}
                            />
                          )}
                        </FlatBadge>
                      </dd>
                    </div>
                  )}

                  {vuln.additional?.importance && (
                    <div className="flex flex-col items-start justify-between  border-t py-3 gap-2">
                      <dt className="text-xs text-muted-foreground">
                        Importance
                      </dt>
                      <dd>
                        <FlatBadge
                          variant={importanceVariant(
                            vuln.additional.importance.value,
                          )}
                        >
                          {vuln.additional.importance.ns &&
                          vuln.framework !== "Grundschutz++" ? (
                            <Link
                              href={vuln.additional.importance.ns}
                              target="_blank"
                              style={{ color: "inherit" }}
                            >
                              <TokenizedText
                                noUnderline
                                text={vuln.additional.importance.value}
                                definitions={
                                  vuln.additional.importance.definitions
                                }
                                split={false}
                              />
                            </Link>
                          ) : (
                            <TokenizedText
                              text={vuln.additional.importance.value}
                              definitions={
                                vuln.additional.importance.definitions
                              }
                              split={false}
                            />
                          )}
                        </FlatBadge>
                      </dd>
                    </div>
                  )}
                  {vuln.additional?.effort_level && (
                    <div className="flex flex-col items-start justify-between border-t py-3 gap-2">
                      <dt className="text-xs text-muted-foreground">
                        Effort Level
                      </dt>
                      <dd>
                        <FlatBadge
                          variant={effortLevelVariant(
                            vuln.additional.effort_level.value,
                          )}
                        >
                          {vuln.additional.effort_level.ns &&
                          vuln.framework !== "Grundschutz++" ? (
                            <Link
                              href={vuln.additional.effort_level.ns}
                              target="_blank"
                              style={{ color: "inherit" }}
                            >
                              <TokenizedText
                                text={vuln.additional.effort_level.value}
                                noUnderline
                                definitions={
                                  vuln.additional.effort_level.definitions
                                }
                                split={false}
                              />
                            </Link>
                          ) : (
                            <TokenizedText
                              text={vuln.additional.effort_level.value}
                              definitions={
                                vuln.additional.effort_level.definitions
                              }
                              split={false}
                            />
                          )}
                        </FlatBadge>
                      </dd>
                    </div>
                  )}
                  {vuln.additional?.tags && (
                    <div className="flex flex-col items-start justify-between border-t py-3 gap-2">
                      <dt className="text-xs text-muted-foreground">Tags</dt>
                      <dd className="font-medium">
                        {vuln.additional.tags.ns &&
                        vuln.framework !== "Grundschutz++"
                          ? vuln.additional.tags.value
                              .split(",")
                              .map((tag: string) => (
                                <Link
                                  href={vuln.additional.tags.ns}
                                  target="_blank"
                                  style={{ color: "inherit" }}
                                  key={tag}
                                >
                                  <Badge
                                    variant="secondary"
                                    className="mr-2 mb-2"
                                  >
                                    <TokenizedText
                                      text={tag}
                                      noUnderline
                                      definitions={
                                        vuln.additional.tags.definitions
                                      }
                                      split={false}
                                    />
                                  </Badge>
                                </Link>
                              ))
                          : vuln.additional.tags.value
                              .split(",")
                              .map((tag: string) => (
                                <Badge
                                  variant="secondary"
                                  className="mr-2 mb-2"
                                  key={tag}
                                >
                                  <TokenizedText
                                    text={tag}
                                    definitions={
                                      vuln.additional.tags.definitions
                                    }
                                    split={false}
                                  />
                                </Badge>
                              ))}
                      </dd>
                    </div>
                  )}
                  {vuln.additional?.documentation && (
                    <div className="flex flex-col items-start justify-between border-t py-3 gap-2">
                      <dt className="text-xs text-muted-foreground">
                        Documentation
                      </dt>
                      <dd className="font-medium">
                        {vuln.additional.documentation.ns &&
                        vuln.framework !== "Grundschutz++" ? (
                          <Link
                            href={vuln.additional.documentation.ns}
                            target="_blank"
                            style={{ color: "inherit" }}
                          >
                            <TokenizedText
                              text={vuln.additional.documentation.value}
                              definitions={
                                vuln.additional.documentation.definitions
                              }
                            />
                          </Link>
                        ) : (
                          <TokenizedText
                            text={vuln.additional.documentation.value}
                            definitions={
                              vuln.additional.documentation.definitions
                            }
                          />
                        )}
                      </dd>
                    </div>
                  )}
                  {vuln.additional?.result && (
                    <div className="flex flex-col items-start justify-betweens border-t py-3 gap-2">
                      <dt className="text-xs text-muted-foreground">Result</dt>
                      <dd className="font-medium">
                        {vuln.additional.result.ns &&
                        vuln.framework !== "Grundschutz++" ? (
                          <Link
                            href={vuln.additional.result.ns}
                            target="_blank"
                            style={{ color: "inherit" }}
                          >
                            <TokenizedText
                              text={vuln.additional.result.value}
                              definitions={vuln.additional.result.definitions}
                            />
                          </Link>
                        ) : (
                          <TokenizedText
                            text={vuln.additional.result.value}
                            definitions={vuln.additional.result.definitions}
                          />
                        )}
                      </dd>
                    </div>
                  )}
                  {vuln.additional?.result_specification && (
                    <div className="flex flex-col items-start justify-between gap-2 border-t py-3">
                      <dt className="text-xs text-muted-foreground">
                        Result Specification
                      </dt>
                      <dd className="font-medium">
                        {vuln.additional.result_specification.ns &&
                        vuln.framework !== "Grundschutz++" ? (
                          <Link
                            href={vuln.additional.result_specification.ns}
                            target="_blank"
                            style={{ color: "inherit" }}
                          >
                            <TokenizedText
                              text={vuln.additional.result_specification.value}
                              definitions={
                                vuln.additional.result_specification.definitions
                              }
                            />
                          </Link>
                        ) : (
                          <TokenizedText
                            text={vuln.additional.result_specification.value}
                            definitions={
                              vuln.additional.result_specification.definitions
                            }
                          />
                        )}
                      </dd>
                    </div>
                  )}
                  {vuln.mappedControls?.length > 0 && (
                    <div className="flex flex-col items-start justify-between gap-2 border-t py-3">
                      <dt className="text-xs text-muted-foreground">
                        Mapped Controls
                      </dt>
                      <dd className="font-medium w-full">
                        {Object.entries(
                          (
                            vuln.mappedControls as {
                              relatedFramework: string;
                              relatedControlId: string;
                              relationship: ControlRelationship;
                            }[]
                          ).reduce<
                            Record<
                              string,
                              {
                                relatedControlId: string;
                                relationship: ControlRelationship;
                              }[]
                            >
                          >((acc, control) => {
                            (acc[control.relatedFramework] ??= []).push({
                              relatedControlId: control.relatedControlId,
                              relationship: control.relationship,
                            });
                            return acc;
                          }, {}),
                        ).map(([framework, controls]) => (
                          <MappedControlsGroup
                            key={framework}
                            framework={framework}
                            controls={controls}
                          />
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default CompliancePostureDetailView;
