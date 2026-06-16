"use client";

import Page from "@/components/Page";

import { browserApiClient } from "@/services/devGuardApi";
import type { DetailedComplianceRiskDTO, VulnEventDTO } from "@/types/api/api";
import Image from "next/image";

import RiskAssessmentFeed from "@/components/risk-assessment/RiskAssessmentFeed";
import { AsyncButton, Button } from "@/components/ui/button";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { useSession } from "@/context/SessionContext";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { useState } from "react";
import Markdown from "react-markdown";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import AssetTitle from "@/components/common/AssetTitle";
import { getIntegrationNameFromRepositoryIdOrExternalProviderId } from "@/utils/view";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import VulnState from "@/components/common/VulnState";
import { useActiveAssetVersion } from "@/hooks/useActiveAssetVersion";
import GitProviderIcon from "@/components/GitProviderIcon";
import useSWR from "swr";
import useDecodedParams from "@/hooks/useDecodedParams";
import { fetcher } from "@/data-fetcher/fetcher";
import { Skeleton } from "@/components/ui/skeleton";
import Err from "@/components/common/Err";
import RiskAssessmentFeedSkeleton from "../../../../../../../../../../../components/risk-assessment/RiskAssessmentFeedSkeleton";
import EditorSkeleton from "../../../../../../../../../../../components/risk-assessment/EditorSkeleton";
import { useDeleteEvent } from "@/hooks/useDeleteEvent";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MarkdownEditor = dynamic(
  () => import("@/components/common/MarkdownEditor"),
  {
    ssr: false,
  },
);

const Index = () => {
  const params = useDecodedParams();
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug, vulnId } =
    params;

  // Fetch the compliance risk from the real endpoint.
  const {
    data: vuln,
    error,
    isLoading,
    mutate,
  } = useSWR<DetailedComplianceRiskDTO>(
    organizationSlug && projectSlug && assetSlug && assetVersionSlug && vulnId
      ? `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/compliance-risks/${vulnId}/`
      : null,
    fetcher,
  );

  const activeOrg = useActiveOrg();
  const project = useActiveProject();

  const assetMenu = useAssetMenu();
  const asset = useActiveAsset()!;

  const assetVersion = useActiveAssetVersion();
  const { session } = useSession();
  const [justification, setJustification] = useState<string | undefined>(
    undefined,
  );
  const deleteEvent = useDeleteEvent();

  // Show loading skeleton if data is loading
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

  // Show error state
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
            userId: session?.identity.id ?? "",
            vulnId: vuln.id,
            vulnType: "firstPartyVuln",
            vulnerabilityName: vuln.policyTitle,
            originalAssetVersionName: assetVersion?.name ?? "",
            arbitraryJSONData: { scannerIds: "" },
            packageName: null,
            uri: null,
            createdByVexRule: false,
          } as VulnEventDTO)
        : undefined;

    const mutatePromise = mutate(
      async (current) => {
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
              "/compliance-risks/" +
              vuln.id +
              "/mitigate",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
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
              "/compliance-risks/" +
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
    <Page
      Menu={assetMenu}
      Title={<AssetTitle />}
      title={vuln.policyTitle ?? "Compliance Risk"}
    >
      <div className="flex flex-row gap-4">
        <div className="flex-1">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <h1 className="text-2xl font-semibold">
                {vuln.policyTitle ?? "Compliance Risk"}
              </h1>
              <div className="mt-4 text-muted-foreground">
                <Markdown>
                  {vuln.policyDescription?.replaceAll("\n", "\n\n")}
                </Markdown>
              </div>
              <div className="mt-4 flex flex-row flex-wrap gap-2 text-sm">
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
                <VulnState state={vuln.state} />

                {vuln.policyFrameworks?.map((f) => (
                  <Badge key={f.framework} variant={"secondary"}>
                    {f.framework}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 rounded-lg border bg-secondary p-4">
                <h3 className="mb-2 text-sm font-semibold">
                  Violations ({vuln.violations?.length ?? 0})
                </h3>
                {vuln.violations?.length ? (
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    {vuln.violations.map((violation, idx) => (
                      <li key={idx}>{violation}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No violations recorded for this policy.
                  </p>
                )}
              </div>
              <div className="mt-16">
                <RiskAssessmentFeed
                  vulnerabilityName={vuln.policyTitle ?? ""}
                  events={vuln.events}
                  page="compliance-risks"
                  deleteEvent={handleDeleteEvent}
                />
              </div>
              <AuthGuard require="member">
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {vuln.state === "open"
                          ? "Add a comment"
                          : "Reopen this vulnerability"}
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
                              {vuln.ticketId === null &&
                                getIntegrationNameFromRepositoryIdOrExternalProviderId(
                                  asset,
                                  project,
                                ) === undefined && (
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
                                      tracker in the {` `}
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
                                getIntegrationNameFromRepositoryIdOrExternalProviderId(
                                  asset,
                                  project,
                                ) === "gitlab" && (
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
                                getIntegrationNameFromRepositoryIdOrExternalProviderId(
                                  asset,
                                  project,
                                ) === "github" && (
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
                                          alt="GitLab Logo"
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
                                getIntegrationNameFromRepositoryIdOrExternalProviderId(
                                  asset,
                                  project,
                                ) === "jira" && (
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

                              <AsyncButton
                                onClick={() =>
                                  handleSubmit({
                                    status: "accepted",
                                    justification,
                                  })
                                }
                                variant={"secondary"}
                              >
                                Accept risk
                              </AsyncButton>
                              <AsyncButton
                                onClick={() =>
                                  handleSubmit({
                                    status: "falsePositive",
                                    justification,
                                  })
                                }
                                variant={"secondary"}
                              >
                                False Positive
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
                            You can reopen this vuln, if you plan to mitigate
                            the risk now, or accepted this vuln by accident.
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
                    </CardContent>
                  </Card>
                </div>
              </AuthGuard>
            </div>
            <div className="col-span-1 p-4 border-l pt-0">
              <h3 className="mb-2 text-lg font-semibold">Policy Details</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd className="font-medium">
                    {vuln.createdAt
                      ? new Date(vuln.createdAt).toLocaleString()
                      : "—"}
                  </dd>
                </div>
                {vuln.policyFrameworks?.length > 0 && (
                  <div>
                    <dt className="text-muted-foreground">Frameworks</dt>
                    <dd className="flex flex-row flex-wrap gap-1 pt-1">
                      {vuln.policyFrameworks.map((f) => (
                        <Badge key={f.framework} variant="secondary">
                          {f.framework}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                )}
                {vuln.policyDescription && (
                  <div>
                    <dt className="text-muted-foreground">Description</dt>
                    <dd className="text-muted-foreground">
                      <Markdown>{vuln.policyDescription}</Markdown>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default Index;
