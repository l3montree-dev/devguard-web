// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import DateString from "@/components/common/DateString";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { classNames } from "@/utils/common";
import type { AssetVersionDTO } from "@/types/dto";
import { GitBranchIcon, Loader2, TagIcon } from "lucide-react";
import type { FunctionComponent } from "react";

interface Props {
  isTesting: boolean;
  result: { kept: AssetVersionDTO[]; toDelete: AssetVersionDTO[] } | null;
  error: string | null;
}

// Styled like the tables on the refs page.
const RefTable: FunctionComponent<{
  title: string;
  assetVersions: AssetVersionDTO[];
  emptyText: string;
  className?: string;
}> = ({ title, assetVersions, emptyText, className }) => (
  <div className="flex min-w-0 flex-col gap-2">
    <span className={cn("text-sm font-medium", className)}>
      {title} ({assetVersions.length})
    </span>
    <div className="overflow-hidden rounded-lg border">
      <div className="max-h-80 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 border-b bg-card text-foreground">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Created</th>
              <th className="p-4 text-left">Last scan received</th>
            </tr>
          </thead>
          <tbody>
            {assetVersions.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-left text-muted-foreground">
                  {emptyText}
                </td>
              </tr>
            )}
            {assetVersions.map((assetVersion, i) => (
              <tr
                key={assetVersion.slug}
                className={classNames(
                  "border-b last:border-b-0",
                  i % 2 !== 0 && "bg-card/50",
                )}
              >
                <td className="px-4 py-2">
                  <div className="flex flex-row flex-wrap items-center gap-1">
                    <Badge variant="outline">
                      {assetVersion.type === "tag" ? (
                        <TagIcon className="mr-1 h-3 w-3 text-muted-foreground" />
                      ) : (
                        <GitBranchIcon className="mr-1 h-3 w-3 text-muted-foreground" />
                      )}
                      {assetVersion.name}
                    </Badge>
                    {assetVersion.defaultBranch && (
                      <Badge variant="secondary">default</Badge>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-2">
                  <DateString date={new Date(assetVersion.createdAt)} />
                </td>
                <td className="whitespace-nowrap px-4 py-2">
                  {assetVersion.lastUploadAt ? (
                    <DateString date={new Date(assetVersion.lastUploadAt)} />
                  ) : (
                    "Never"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

/** What the policy would do to the current branches and tags, right now. */
const RetentionPolicyPreview: FunctionComponent<Props> = ({
  isTesting,
  result,
  error,
}) => {
  const total = result ? result.kept.length + result.toDelete.length : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-2 text-sm">
        <span className="font-medium">Preview</span>
        {isTesting ? (
          <span className="flex flex-row items-center gap-1 text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Testing against your branches and tags…
          </span>
        ) : error ? null : result && result.toDelete.length > 0 ? (
          <span className="text-destructive">
            Would delete {result.toDelete.length} of {total} branches and tags
          </span>
        ) : result ? (
          <span className="text-muted-foreground">
            Keeps all {total} branches and tags
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">
          {error}
        </p>
      ) : (
        result && (
          <div
            className={cn(
              "grid grid-cols-1 gap-4 transition-opacity xl:grid-cols-2",
              isTesting && "opacity-50",
            )}
          >
            <RefTable
              title="Deleted"
              assetVersions={result.toDelete}
              emptyText="Nothing would be deleted."
              className="text-destructive"
            />
            <RefTable
              title="Kept"
              assetVersions={result.kept}
              emptyText="Every branch and tag would be deleted."
            />
          </div>
        )
      )}
    </div>
  );
};

export default RetentionPolicyPreview;
