"use client";

import useSWR, { mutate } from "swr";
import Page from "@/components/Page";
import { fetcher } from "@/data-fetcher/fetcher";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useDecodedParams from "@/hooks/useDecodedParams";
import { Skeleton } from "@/components/ui/skeleton";
import type { SecurityAdvisory } from "@/types/api/api";
import { getSeverityClassNames } from "@/components/common/Severity";
import Markdown from "@/components/common/Markdown";
import { classNames } from "@/utils/common";
import { Button } from "@/components/ui/button";
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
import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "@/lib/toast";
import { notFound, useRouter } from "next/navigation";
import { CVSS31_METRICS, CVSS40_METRICS, parseCvssVector } from "@/utils/cvss";
import AdvisoryDialog, {
  type AdvisoryFormData,
} from "@/components/AdvisoryDialog";
import AuthGuard from "@/components/AuthGuard";

const Index = () => {
  const router = useRouter();
  const params = useDecodedParams();
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

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

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

  const handleDeleteAdvisory = async () => {
    const resp = await browserApiClient(`${advisoryUrl}` + `/${advisoryId}/`, {
      method: "DELETE",
    });

    if (resp.ok) {
      toast.success("Advisory deleted successfully");
      mutate(advisoryUrl);
      setOpen(false);
      router.push(advisoryListPath);
    } else {
      toast.error("Failed to delete advisory");
    }
  };

  const {
    data: advisory,
    isLoading,
    error,
  } = useSWR<SecurityAdvisory>(
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

  const severityUpper = advisory.severity?.toUpperCase() ?? "";
  const parsed = advisory.vectorstring
    ? parseCvssVector(advisory.vectorstring)
    : null;
  const metricDefs =
    parsed?.version === "4.0"
      ? CVSS40_METRICS
      : parsed?.version === "3.1"
        ? CVSS31_METRICS
        : null;

  return (
    <Page
      Menu={assetMenu}
      Title={"Security Advisory"}
      title={advisory.title ?? advisory.id}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">{advisory.title}</h1>
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
                      <td className="p-3 font-medium">{pkg.packagename}</td>
                      <td className="p-3 text-muted-foreground">
                        {pkg.semverStart ? `< v${pkg.semverStart}` : "—"}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {pkg.semverEnd ? `v${pkg.semverEnd}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {advisory.description && (
            <div className="rounded-lg border p-4">
              <h2 className="text-base font-semibold mb-3">Description</h2>
              <Markdown>{advisory.description}</Markdown>
            </div>
          )}
          <div className="flex justify-end my-4 gap-2">
            <AuthGuard require="admin">
              <Button onClick={() => setEditOpen(true)} variant="outline">
                Change Advisory
              </Button>
              <Button onClick={() => setOpen(true)} variant="destructive">
                Delete Advisory
              </Button>
            </AuthGuard>
          </div>
        </div>

        <div className="w-full lg:w-72 shrink-0">
          <div className="rounded-lg border p-4 flex flex-col gap-4">
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2">
                Severity
              </div>
              <span
                className={classNames(
                  "inline-flex px-2 py-0.5 text-xs font-medium rounded-full",
                  getSeverityClassNames(severityUpper, false),
                )}
              >
                {advisory.severity}
              </span>
            </div>

            {advisory.vectorstring && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-2">
                  Vector
                </div>
                <code className="text-xs break-all text-muted-foreground">
                  {advisory.vectorstring}
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
            vectorString: advisory.vectorstring,
            affectedPackages: (advisory.affectedPackages ?? []).map(
              ({ id, ...rest }) => rest,
            ),
          }}
          onSubmit={handleChangeAdvisory}
        />
      )}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <TriangleAlert className="mr-2 inline-block h-6 w-6 text-destructive" />
              Are you sure you want to delete this advisory?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All data associated with this
              advisory will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteAdvisory()}>
              <span>Confirm</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
};

export default Index;
