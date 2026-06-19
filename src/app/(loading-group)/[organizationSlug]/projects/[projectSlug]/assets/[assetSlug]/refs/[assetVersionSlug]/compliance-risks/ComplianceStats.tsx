"use client";

import type { FunctionComponent, ReactNode } from "react";
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

// TODO(backend): "Controls covered" and "Last attestation" are not exposed by the
// compliance-risks API yet, so they are mocked below. The clean fix is a dedicated
// summary endpoint (e.g. `…/compliance-risks/stats`) returning all four figures so
// the component reads one source instead of deriving counts. Target shape:
//   interface ComplianceStatsDTO {
//     openRisks: number;
//     resolvedRisks: number;
//     controlsCovered: number;
//     controlsTotal: number;
//     lastAttestationAt: string | null; // ISO timestamp, formatted to relative time
//   }
// Until then Open/Resolved come from the two count fetches below, and the remaining
// tiles render these placeholders:
const MOCK_CONTROLS_COVERED = 7;
const MOCK_CONTROLS_TOTAL = 43;
const MOCK_LAST_ATTESTATION = "2h ago"; // later: relative time from lastAttestationAt

interface TileProps {
  label: string;
  colorClass?: string;
  isLoading?: boolean;
  children: ReactNode;
}

// Presentational only: owns the card/label/loading chrome. Each metric passes its
// own already-formatted figure as children, so numbers, ratios and time strings all
// render without widening a shared value type.
const StatTile: FunctionComponent<TileProps> = ({
  label,
  colorClass,
  isLoading = false,
  children,
}) => (
  <Card>
    <CardHeader>
      <CardDescription>{label}</CardDescription>
      {isLoading ? (
        <Skeleton className="h-10 w-12" />
      ) : (
        <CardTitle className={classNames("text-4xl", colorClass)}>
          {children}
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
    <div className="grid w-full grid-cols-4 gap-4">
      <StatTile
        label="Open risks"
        colorClass="text-red-500"
        isLoading={openLoading}
      >
        {open?.total ?? 0}
      </StatTile>
      <StatTile
        label="Resolved"
        colorClass="text-green-500"
        isLoading={resolvedLoading}
      >
        {resolved?.total ?? 0}
      </StatTile>
      {/* TODO(backend): replace mock with real control coverage */}
      <StatTile label="Controls covered" colorClass="text-muted-foreground">
        {MOCK_CONTROLS_COVERED} / {MOCK_CONTROLS_TOTAL}
      </StatTile>
      {/* TODO(backend): replace mock with real last attestation timestamp */}
      <StatTile label="Last attestation" colorClass="text-muted-foreground">
        {MOCK_LAST_ATTESTATION}
      </StatTile>
    </div>
  );
};

export default ComplianceStats;
