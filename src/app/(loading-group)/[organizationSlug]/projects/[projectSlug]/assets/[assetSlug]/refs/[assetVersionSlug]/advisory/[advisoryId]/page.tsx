"use client";

import useSWR from "swr";
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

const Index = () => {
  const params = useDecodedParams();
  const {
    organizationSlug,
    projectSlug,
    assetSlug,
    assetVersionSlug,
    advisoryId,
  } = params;
  const assetMenu = useAssetMenu();
  const { data: advisory, isLoading } = useSWR<SecurityAdvisory>(
    organizationSlug &&
      projectSlug &&
      assetSlug &&
      assetVersionSlug &&
      advisoryId
      ? `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/advisory/${advisoryId}/`
      : null,
    fetcher,
  );

  if (isLoading || !advisory) {
    return (
      <Page title="Loading...">
        <Skeleton className="w-64 h-8 mb-2" />
        <Skeleton className="w-24 h-5 mb-6" />
        <Skeleton className="w-full h-32 mb-4" />
        <Skeleton className="w-full h-48" />
      </Page>
    );
  }

  const severityUpper = advisory.severity?.toUpperCase() ?? "";

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

          {advisory.affectedPackages.length > 0 && (
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
                  {advisory.affectedPackages.map((pkg) => (
                    <tr key={pkg.id} className="border-b last:border-0">
                      <td className="p-3 font-medium">{pkg.packagename}</td>
                      <td className="p-3 text-muted-foreground">
                        {pkg.semverStart ? `< ${pkg.semverStart}` : "—"}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {pkg.semverEnd ?? "—"}
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
          </div>
        </div>
      </div>
    </Page>
  );
};

export default Index;
