"use client";

import type { FunctionComponent } from "react";
import useSWR from "swr";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/data-fetcher/fetcher";
import type { ComplianceRiskDTO, Paged } from "@/types/api/api";
import { classNames } from "@/utils/common";

interface Props {
  // Base asset URI, e.g. "/organizations/<org>/projects/<proj>/assets/<asset>/"
  uri: string;
  assetVersionSlug: string;
}

interface TileProps {
  label: string;
  value?: number;
  isLoading: boolean;
  colorClass: string;
}

const StatTile: FunctionComponent<TileProps> = ({
  label,
  value,
  isLoading,
  colorClass,
}) => (
  <Card>
    <CardHeader>
      <CardDescription>{label}</CardDescription>
      {isLoading ? (
        <Skeleton className="h-10 w-12" />
      ) : (
        <CardTitle className={classNames("text-4xl", colorClass)}>
          {value ?? 0}
        </CardTitle>
      )}
    </CardHeader>
  </Card>
);

const ComplianceStats: FunctionComponent<Props> = ({
  uri,
  assetVersionSlug,
}) => {
  const base = uri + "refs/" + assetVersionSlug + "/compliance-risks/";

  // Count-only fetches: pageSize=1 means the backend returns just one row plus the
  // `total` count we actually want (same `total` that powers CustomPagination).
  // These are independent of the table's active Open/Closed tab so both tiles
  // always show, and SWR dedupes them against the list's own request.
  const { data: open, isLoading: openLoading } = useSWR<
    Paged<ComplianceRiskDTO>
  >(base + "?filterQuery[state][is]=open&pageSize=1", fetcher, {
    keepPreviousData: true,
  });

  const { data: resolved, isLoading: resolvedLoading } = useSWR<
    Paged<ComplianceRiskDTO>
  >(base + "?filterQuery[state][is not]=open&pageSize=1", fetcher, {
    keepPreviousData: true,
  });

  return (
    <div className="grid w-full grid-cols-2 gap-4">
      <StatTile
        label="Open risks"
        value={open?.total}
        isLoading={openLoading}
        colorClass="text-red-500"
      />
      <StatTile
        label="Resolved"
        value={resolved?.total}
        isLoading={resolvedLoading}
        colorClass="text-green-500"
      />
    </div>
  );
};

export default ComplianceStats;
