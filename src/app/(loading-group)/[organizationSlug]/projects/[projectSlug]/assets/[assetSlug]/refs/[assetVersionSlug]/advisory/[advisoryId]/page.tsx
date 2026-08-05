"use client";

import useSWR, { mutate } from "swr";
import Page from "@/components/Page";
import { fetcher } from "@/data-fetcher/fetcher";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useDecodedParams from "@/hooks/useDecodedParams";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  DetailedSecurityAdvisoryDTO,
  VulnEventDTO,
} from "@/types/api/api";
import Severity from "@/components/common/Severity";
import Markdown from "@/components/common/Markdown";
import { AsyncButton, Button } from "@/components/ui/button";
import { browserApiClient } from "@/services/devGuardApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "@/lib/toast";
import { notFound, useRouter } from "next/navigation";
import {
  CVSS31_METRICS,
  CVSS40_METRICS,
  parseCvssVector,
  vectorStringToScore,
} from "@/utils/cvss";
import AdvisoryDialog, {
  type AdvisoryFormData,
} from "@/components/AdvisoryDialog";
import AuthGuard from "@/components/AuthGuard";
import { useConfig } from "@/context/ConfigContext";
import RiskAssessmentFeed from "@/components/risk-assessment/RiskAssessmentFeed";
import { withVPrefix } from "@/services/versionCheck";
import { useDeleteEvent } from "@/hooks/useDeleteEvent";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/context/SessionContext";
import dynamic from "next/dynamic";

const MarkdownEditor = dynamic(
  () => import("@/components/common/MarkdownEditor"),
  { ssr: false },
);

const Index = () => {
  const router = useRouter();
  const params = useDecodedParams();
  const config = useConfig();
  const deleteEvent = useDeleteEvent();
  const { session } = useSession();
  const [justification, setJustification] = useState<string | undefined>(
    undefined,
  );
  const {
    organizationSlug,
    projectSlug,
    assetSlug,
    assetVersionSlug,
    advisoryId,
  } = params;
  const assetMenu = useAssetMenu();

  const advisoryUrl = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/advisory`;
  const advisoryListPath = `/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/advisory`;

  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState<
    null | "delete" | "publish" | "withdraw"
  >(null);

  const handleChangeAdvisory = async (data: AdvisoryFormData) => {
    const resp = await browserApiClient(`${advisoryUrl}` + `/${advisoryId}/`, {
      method: "PATCH",
      body: JSON.stringify({ ...data }),
    });
    if (resp.ok) {
      toast.success("Advisory edited successfully");
      mutate(`${advisoryUrl}` + `/${advisoryId}/`);
      mutate(advisoryUrl);
      setEditOpen(false);
    } else {
      const msg = await resp.text();
      toast.error("Failed to edit advisory: " + msg);
      throw new Error(msg);
    }
  };

  const handlePublishAdvisory = async () => {
    const resp = await browserApiClient(
      `${advisoryUrl}` + `/${advisoryId}/events/`,
      {
        method: "POST",
        body: JSON.stringify({ status: "published" }),
      },
    );
    if (resp.ok) {
      toast.success("Advisory published successfully");
      mutate(`${advisoryUrl}` + `/${advisoryId}/`);
      mutate(advisoryUrl);
      setConfirm(null);
    } else {
      const msg = await resp.text();
      toast.error("Failed to edit advisory: " + msg);
      throw new Error(msg);
    }
  };

  const handleWithdrawAdvisory = async () => {
    const resp = await browserApiClient(
      `${advisoryUrl}` + `/${advisoryId}/events/`,
      {
        method: "POST",
        body: JSON.stringify({ status: "withdrawn" }),
      },
    );
    if (resp.ok) {
      toast.success("Advisory withdrawn successfully");
      mutate(`${advisoryUrl}` + `/${advisoryId}/`);
      mutate(advisoryUrl);
      setConfirm(null);
    } else {
      const msg = await resp.text();
      toast.error("Failed to withdraw advisory: " + msg);
      throw new Error(msg);
    }
  };

  const handleDeleteAdvisory = async () => {
    const resp = await browserApiClient(`${advisoryUrl}` + `/${advisoryId}/`, {
      method: "DELETE",
    });

    if (resp.ok) {
      toast.success("Advisory deleted successfully");
      mutate(advisoryUrl);
      setConfirm(null);
      router.push(advisoryListPath);
    } else {
      toast.error("Failed to delete advisory");
    }
  };

  const {
    data: advisory,
    isLoading,
    error,
    mutate: mutateAdvisory,
  } = useSWR<DetailedSecurityAdvisoryDTO>(
    organizationSlug &&
      projectSlug &&
      assetSlug &&
      assetVersionSlug &&
      advisoryId
      ? `${advisoryUrl}` + `/${advisoryId}/`
      : null,
    fetcher,
  );

  if (isLoading) {
    return (
      <Page title="Loading...">
        <Skeleton className="w-64 h-8 mb-2" />
        <Skeleton className="w-24 h-5 mb-6" />
        <Skeleton className="w-full h-32 mb-4" />
        <Skeleton className="w-full h-48" />
      </Page>
    );
  }

  if (error || !advisory) {
    notFound();
  }

  const severityScore = advisory.vectorString
    ? vectorStringToScore(advisory.vectorString)
    : null;
  const parsed = advisory.vectorString
    ? parseCvssVector(advisory.vectorString)
    : null;
  const csafYear = new Date(advisory.createdAt).getFullYear();
  const csafUrl = `${config.devguardApiUrlPublicInternet}/api/v1/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/csaf/white/${csafYear}/dgsa-${advisory.id}.json`;
  const metricDefs =
    parsed?.version === "4.0"
      ? CVSS40_METRICS
      : parsed?.version === "3.1"
        ? CVSS31_METRICS
        : null;

  const confirmConfig = {
    delete: {
      icon: (
        <TriangleAlert className="mr-2 inline-block h-6 w-6 text-destructive" />
      ),
      title: "Are you sure you want to delete this advisory?",
      description:
        "This action cannot be undone. All data associated with this advisory will be deleted.",
      variant: "destructive",
      onConfirm: handleDeleteAdvisory,
    },
    publish: {
      icon: <Eye className="mr-2 inline-block h-6 w-6 text-primary" />,
      title: "Are you sure you want to publish this advisory?",
      description:
        "NOTE: This feature is still work in progress. This publishment will only add the Advisory to the CSAF report. This action cannot be undone. All data associated with this advisory will be published.",
      variant: "default",
      onConfirm: handlePublishAdvisory,
    },
    withdraw: {
      icon: (
        <TriangleAlert className="mr-2 inline-block h-6 w-6 text-destructive" />
      ),
      title: "Are you sure you want to withdraw this advisory?",
      description:
        "This action cannot be undone. The advisory stays public but is marked as withdrawn and can no longer be changed.",
      variant: "destructive",
      onConfirm: handleWithdrawAdvisory,
    },
  } as const;

  const activeConfirm = confirm ? confirmConfig[confirm] : null;

  const visibilityConfig = {
    draft: { label: "Draft", variant: "secondary" },
    public: { label: "Published", variant: "success" },
    withdrawn: { label: "Withdrawn", variant: "danger" },
  } as const;

  const visibilityBadge = visibilityConfig[
    advisory.state as keyof typeof visibilityConfig
  ] ?? {
    label: advisory.state,
    variant: "secondary" as const,
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
    mutateAdvisory();
  };

  const handleSubmit = async (data: {
    status?: VulnEventDTO["type"];
    justification?: string;
    mechanicalJustification?: string;
  }): Promise<boolean> => {
    if (data.status === undefined || !advisory) {
      return false;
    }

    if (!Boolean(data.justification)) {
      toast.error("Please provide a justification");
      return false;
    }

    const optimisticEvent = {
      type: data.status,
      id: "optimistic",
      createdAt: new Date().toISOString(),
      justification: data.justification ?? "",
      mechanicalJustification: data.mechanicalJustification ?? "",
      userId: session?.identity.id ?? "",
      vulnId: advisory.id,
      vulnType: "securityAdvisory",
      vulnerabilityName: advisory.title ?? advisory.id,
      createdByVexRule: false,
    } as VulnEventDTO;

    const mutatePromise = mutateAdvisory(
      async (current) => {
        const resp = await browserApiClient(
          `${advisoryUrl}` + `/${advisoryId}/events/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          },
        );
        const json = await resp.json();

        if (!json.events) {
          toast.error("Failed to add comment");
          throw new Error("Failed to add comment");
        }
        setJustification("");
        return {
          ...current!,
          ...json,
          events: current!.events.concat([json.events.slice(-1)[0]]),
        };
      },
      {
        optimisticData: {
          ...advisory,
          events: advisory.events.concat([optimisticEvent]),
        },
        rollbackOnError: true,
        revalidate: false,
      },
    );

    mutatePromise.then(() => toast.success("Comment added")).catch(() => {});
    return true;
  };

  return (
    <Page
      Menu={assetMenu}
      Title={"Security Advisory"}
      title={advisory.title ?? advisory.id}
      breadcrumbs={[
        { title: "Security Advisories", href: "./" },
        { title: advisory.title ?? advisory.id, href: "" },
      ]}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="flex-1 min-w-0">
          <div className="mb-6 flex flex-row gap-2 items-center">
            <h1 className="text-2xl font-semibold">{advisory.title}</h1>
            <Badge className="h-full" variant={visibilityBadge.variant}>
              {visibilityBadge.label}
            </Badge>
            {advisory.state !== "draft" && (
              <a
                href={csafUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="ml-auto text-sm text-link"
              >
                See in CSAF format
              </a>
            )}
          </div>

          {(advisory.affectedPackages?.length ?? 0) > 0 && (
            <div className="mb-6 overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-card">
                  <tr>
                    <th className="p-3 text-left font-medium">Package</th>
                    <th className="p-3 text-left font-medium">
                      Affected versions
                    </th>
                    <th className="p-3 text-left font-medium">
                      Patched versions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {advisory.affectedPackages?.map((pkg) => (
                    <tr key={pkg.id} className="border-b last:border-0">
                      <td className="p-3 font-medium">{pkg.packageName}</td>
                      <td className="p-3 text-muted-foreground">
                        {pkg.versionStart
                          ? `< ${withVPrefix(pkg.versionStart)}`
                          : "—"}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {pkg.versionEnd ? withVPrefix(pkg.versionEnd) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {advisory.description && (
            <div className="rounded-lg">
              <h2 className="text-base font-semibold mb-3">Description</h2>
              <Markdown>{advisory.description}</Markdown>
            </div>
          )}
          {advisory.events && advisory.events.length > 0 && (
            <div className="mt-16">
              <RiskAssessmentFeed
                vulnerabilityName={advisory.title ?? advisory.id}
                events={advisory.events}
                page="security-advisory"
                deleteEvent={handleDeleteEvent}
              />
            </div>
          )}
          <Card>
            <CardContent className="mt-4">
              <AuthGuard require="admin">
                <div className="flex flex-col gap-4">
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
                    <div className="flex flex-row items-start gap-2 pt-2">
                      {advisory.state === "draft" && (
                        <>
                          <Button
                            onClick={() => setConfirm("delete")}
                            variant="destructive"
                          >
                            Delete Draft
                          </Button>
                          <Button
                            onClick={() => setEditOpen(true)}
                            variant="outline"
                          >
                            Change Draft
                          </Button>
                          <Button
                            onClick={() => setConfirm("publish")}
                            variant="secondary"
                          >
                            Publish Draft
                          </Button>
                        </>
                      )}
                      {advisory.state === "public" && (
                        <Button
                          onClick={() => setConfirm("withdraw")}
                          variant="destructive"
                        >
                          Withdraw Advisory
                        </Button>
                      )}
                      <AsyncButton
                        data-testid="add-comment"
                        onClick={() =>
                          handleSubmit({ status: "comment", justification })
                        }
                        variant={"default"}
                      >
                        Comment
                      </AsyncButton>
                    </div>
                  </div>
                </div>
              </AuthGuard>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-72 shrink-0">
          <div className="rounded-lg border p-4 flex flex-col gap-4">
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2">
                Severity
              </div>
              {severityScore !== null ? (
                <div className="flex">
                  <Severity risk={severityScore} />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {advisory.severity}
                </span>
              )}
            </div>

            {advisory.vectorString && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-2">
                  Vector
                </div>
                <code className="text-xs break-all text-muted-foreground">
                  {advisory.vectorString}
                </code>
              </div>
            )}

            {parsed && metricDefs && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-2">
                  CVSS v{parsed.version} Base Metrics
                </div>
                <div className="flex flex-col gap-2">
                  {(() => {
                    const seenGroups = new Set<string>();
                    return metricDefs.map((metric) => {
                      const raw = parsed.metrics[metric.key];
                      if (!raw) return null;
                      const label =
                        metric.options.find(
                          (o) => o.v.replace(/[()]/g, "") === raw,
                        )?.l ?? raw;
                      const isNewGroup =
                        metric.group && !seenGroups.has(metric.group);
                      if (metric.group) seenGroups.add(metric.group);
                      return (
                        <div key={metric.key}>
                          {isNewGroup && (
                            <div className="text-xs font-semibold text-muted-foreground mb-2">
                              {metric.group}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            <div className="flex justify-between">
                              <div>{metric.label}</div>
                              <div className="font-semibold">{label}</div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {editOpen && (
        <AdvisoryDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          initialValues={{
            title: advisory.title,
            description: advisory.description,
            severity: advisory.severity,
            vectorString: advisory.vectorString,
            affectedPackages: (advisory.affectedPackages ?? []).map(
              ({ id, ...rest }) => rest,
            ),
            state: advisory.state,
          }}
          onSubmit={handleChangeAdvisory}
        />
      )}
      <AlertDialog
        open={activeConfirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {activeConfirm?.icon}
              {activeConfirm?.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {activeConfirm?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={activeConfirm?.variant}
              onClick={() => activeConfirm?.onConfirm()}
            >
              <span>Confirm</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
};

export default Index;
