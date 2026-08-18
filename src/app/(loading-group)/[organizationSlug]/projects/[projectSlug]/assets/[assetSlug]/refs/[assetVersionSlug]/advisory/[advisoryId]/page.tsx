"use client";

import AdvisoryComposer from "@/components/advisory/AdvisoryComposer";
import AdvisorySidebar from "@/components/advisory/AdvisorySidebar";
import CsafAccessNotice, {
  useCsafAccess,
} from "@/components/advisory/CsafAccessNotice";
import AdvisoryDialog from "@/components/AdvisoryDialog";
import Markdown from "@/components/common/Markdown";
import Page from "@/components/Page";
import RiskAssessmentFeed from "@/components/risk-assessment/RiskAssessmentFeed";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfig } from "@/context/ConfigContext";
import { useAdvisory } from "@/hooks/useAdvisory";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useDecodedParams from "@/hooks/useDecodedParams";
import { withVPrefix } from "@/services/versionCheck";
import { Eye, TriangleAlert } from "lucide-react";
import { notFound } from "next/navigation";
import { useState } from "react";

const stateBadges = {
  draft: { label: "Draft", variant: "secondary" },
  public: { label: "Published", variant: "success" },
  withdrawn: { label: "Withdrawn", variant: "danger" },
} as const;

const Index = () => {
  const config = useConfig();
  const assetMenu = useAssetMenu();
  const { organizationSlug, projectSlug, assetSlug } = useDecodedParams();
  const { sharesInformation } = useCsafAccess();

  const {
    advisory,
    isLoading,
    error,
    addEvent,
    deleteAdvisory,
    deleteAdvisoryEvent,
    publishAdvisory,
    updateAdvisory,
    withdrawAdvisory,
  } = useAdvisory();

  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState<
    null | "delete" | "publish" | "withdraw"
  >(null);

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

  const csafYear = new Date(advisory.createdAt).getFullYear();
  const csafUrl = `${config.devguardApiUrlPublicInternet}/api/v1/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/csaf/white/${csafYear}/dgsa-${advisory.id}.json`;

  const confirmConfig = {
    delete: {
      icon: (
        <TriangleAlert className="mr-2 inline-block h-6 w-6 text-destructive" />
      ),
      title: "Are you sure you want to delete this advisory?",
      description:
        "This action cannot be undone. All data associated with this advisory will be deleted.",
      variant: "destructive",
      onConfirm: deleteAdvisory,
    },
    publish: {
      icon: <Eye className="mr-2 inline-block h-6 w-6 text-primary" />,
      title: "Are you sure you want to publish this advisory?",
      description:
        "NOTE: This feature is still work in progress. This publishment will only add the Advisory to the CSAF report. This action cannot be undone. All data associated with this advisory will be published.",
      variant: "default",
      onConfirm: publishAdvisory,
    },
    withdraw: {
      icon: (
        <TriangleAlert className="mr-2 inline-block h-6 w-6 text-destructive" />
      ),
      title: "Are you sure you want to withdraw this advisory?",
      description:
        "This action cannot be undone. The advisory stays public but is marked as withdrawn and can no longer be changed.",
      variant: "destructive",
      onConfirm: withdrawAdvisory,
    },
  } as const;

  const stateBadge = stateBadges[
    advisory.state as keyof typeof stateBadges
  ] ?? { label: advisory.state, variant: "secondary" as const };

  const activeConfirm = confirm ? confirmConfig[confirm] : null;
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
            <Badge className="h-full" variant={stateBadge.variant}>
              {stateBadge.label}
            </Badge>
            {advisory.state !== "draft" && sharesInformation && (
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

          {advisory.state !== "draft" && <CsafAccessNotice className="mb-6" />}

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
                deleteEvent={deleteAdvisoryEvent}
              />
            </div>
          )}

          <AdvisoryComposer
            state={advisory.state}
            onComment={(justification) =>
              addEvent({ status: "comment", justification })
            }
            onEdit={() => setEditOpen(true)}
            onDelete={() => setConfirm("delete")}
            onPublish={() => setConfirm("publish")}
            onWithdraw={() => setConfirm("withdraw")}
          />
        </div>

        <div className="w-full lg:w-72 shrink-0">
          <AdvisorySidebar
            severity={advisory.severity}
            vectorString={advisory.vectorString}
          />
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
          onSubmit={updateAdvisory}
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
            {confirm === "publish" && <CsafAccessNotice className="mt-2" />}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={activeConfirm?.variant}
              // radix closes the dialog, failure is already toasted by
              // useAdvisory
              onClick={() => activeConfirm?.onConfirm().catch(() => {})}
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
