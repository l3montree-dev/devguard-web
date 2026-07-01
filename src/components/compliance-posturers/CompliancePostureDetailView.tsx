"use client";

import Page from "@/components/Page";

import { browserApiClient } from "@/services/devGuardApi";
import type {
  AssetDTO,
  AssetVersionDTO,
  DetailedComplianceRiskDTO,
  OrganizationDetailsDTO,
  ProjectDTO,
  VulnEventDTO,
} from "@/types/api/api";
import Image from "next/image";

import RiskAssessmentFeed from "@/components/risk-assessment/RiskAssessmentFeed";
import { AsyncButton, Button } from "@/components/ui/button";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useSession } from "@/context/SessionContext";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Markdown from "react-markdown";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getIntegrationNameFromRepositoryIdOrExternalProviderId } from "@/utils/view";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import VulnState from "@/components/common/VulnState";
import { useActiveAssetVersion } from "@/hooks/useActiveAssetVersion";
import GitProviderIcon from "@/components/GitProviderIcon";
import useSWR from "swr";
import { fetcher } from "@/data-fetcher/fetcher";
import { Skeleton } from "@/components/ui/skeleton";
import FrameworkIcon from "./FrameworkIcon";
import Err from "@/components/common/Err";
import RiskAssessmentFeedSkeleton from "@/components/risk-assessment/RiskAssessmentFeedSkeleton";
import EditorSkeleton from "@/components/risk-assessment/EditorSkeleton";
import { useDeleteEvent } from "@/hooks/useDeleteEvent";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import useDecodedParams from "@/hooks/useDecodedParams";

const MarkdownEditor = dynamic(
  () => import("@/components/common/MarkdownEditor"),
  { ssr: false },
);

interface Props {
  apiBaseUrl: string;
  vulnId: string;
  Menu?: any[];
  Title?: ReactNode;
  showTicketCreation?: boolean;
}

const InheritedHandlingWarning = (
  vuln: DetailedComplianceRiskDTO,
  assetVersionName: AssetVersionDTO | undefined,
  asset: AssetDTO | undefined,
  project: ProjectDTO | undefined,
  orgId: OrganizationDetailsDTO | undefined,
) => {
  if (
    assetVersionName != null &&
    asset != null &&
    !vuln.assetVersionName &&
    !vuln.assetId &&
    vuln.events.length > 0
  )
    return (
      <div className="mt-3 flex items-start gap-2 rounded-md border border-warning-border bg-warning-muted px-3 py-2 text-xs text-warning">
        <span aria-hidden="true" className="mt-0.5 shrink-0">
          ⚠️
        </span>
        <span>
          <span className="sr-only">Warning: </span>
          This compliance posture was handled at a higher level (project or
          organization) and has been inherited here. Any changes you make will
          only apply to this asset and all its children, and will not affect the
          original handling at the higher level.
        </span>
      </div>
    );
  if (project != null && !vuln.projectId && vuln.events.length > 0)
    return (
      <div className="mt-3 flex items-start gap-2 rounded-md border border-warning-border bg-warning-muted px-3 py-2 text-xs text-warning">
        <span aria-hidden="true" className="mt-0.5 shrink-0">
          ⚠️
        </span>
        <span>
          <span className="sr-only">Warning: </span>
          This compliance posture was handled at the organization level and has
          been inherited here. Any changes you make will only apply to this
          project and all its children, and will not affect the
          organization-level handling.
        </span>
      </div>
    );
};

const CompliancePostureDetailView = ({
  apiBaseUrl,
  vulnId,
  Menu,
  Title,
}: Props) => {
  const {
    data: vuln,
    error,
    isLoading,
    mutate,
  } = useSWR<DetailedComplianceRiskDTO>(
    vulnId ? `${apiBaseUrl}${vulnId}/` : null,
    fetcher,
  );

  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();
  const assetVersion = useActiveAssetVersion();
  const { session } = useSession();
  const params = useDecodedParams();
  const { assetSlug, projectSlug } = params;

  const [justification, setJustification] = useState<string | undefined>(
    undefined,
  );
  const deleteEvent = useDeleteEvent();

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
        let json: any;
        if (data.status === "mitigate") {
          const resp = await browserApiClient(
            `${apiBaseUrl}${vuln.frameworkControlId}/mitigate`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ comment: data.justification }),
            },
          );
          json = await resp.json();
        } else {
          const resp = await browserApiClient(
            `${apiBaseUrl}${vuln.frameworkControlId}/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
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
          ...current!,
          ...json,
          events: current!.events.concat([json.events.slice(-1)[0]]),
        };
      },
      {
        optimisticData: optimisticState
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
                <Markdown>
                  {vuln.description?.replaceAll("\n", "\n\n")}
                </Markdown>
              </div>
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
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {vuln.state === "open"
                          ? "Add a comment"
                          : "Mark as not implemented"}
                      </CardTitle>
                      <CardDescription></CardDescription>
                    </CardHeader>
                    <CardContent>
                      {vuln.state === "open" ? (
                        <form
                          className="flex flex-col gap-4"
                          onSubmit={(e) => e.preventDefault()}
                        >
                          <div>
                            <label className="mb-2 block text-sm font-semibold">
                              Comment
                            </label>
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
                                              src={
                                                "/assets/jira-svgrepo-com.svg"
                                              }
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
                            You can mark this compliance posture as not
                            implemented if you made a mistake.
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
                          activeOrg,
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </AuthGuard>
            </div>
            <div className="col-span-1 border-l p-4 pt-0">
              <h3 className="mb-4 text-lg font-semibold">Compliance Details</h3>
              <dl className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <FrameworkIcon
                    framework={vuln.framework}
                    className="h-8 w-8 shrink-0"
                  />
                  <div>
                    <dd className="font-medium">
                      {vuln.framework} {vuln.controlId}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default CompliancePostureDetailView;
