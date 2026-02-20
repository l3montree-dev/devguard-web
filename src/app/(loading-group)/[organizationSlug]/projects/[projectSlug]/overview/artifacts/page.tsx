"use client";
import CVERainbowBadge from "@/components/CVERainbowBadge";
import Page from "@/components/Page";
import AssetTitle from "@/components/common/AssetTitle";
import Section from "@/components/common/Section";
import { useOrganization } from "@/context/OrganizationContext";
import useTable from "@/hooks/useTable";
import { useViewMode } from "@/hooks/useViewMode";
import { ReleaseDTO, RiskHistory } from "@/types/api/api";
import { beautifyPurl, classNames } from "@/utils/common";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import "@xyflow/react/dist/style.css";
import { groupBy } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import { FunctionComponent, useMemo } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import SortingCaret from "../../../../../../../components/common/SortingCaret";
import { Skeleton } from "../../../../../../../components/ui/skeleton";
import { fetcher } from "../../../../../../../data-fetcher/fetcher";
import useDecodedParams from "../../../../../../../hooks/useDecodedParams";
import { RedirectorBuilder, sortRisk } from "../../../../../../../utils/view";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../../../../../../components/ui/tabs";

const columnHelper = createColumnHelper<{
  risk: RiskHistory;
  release: ReleaseDTO;
}>();

const columnsDef: ColumnDef<{ risk: RiskHistory; release: ReleaseDTO }, any>[] =
  [
    columnHelper.accessor("risk.artifactName", {
      header: "Artifact",
      id: "artifact_name",
      cell: (row) => (
        <span className="flex flex-row items-start gap-2">
          {row.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.risk, {
      header: "Score",
      id: "critical",
      cell: (row) => {
        const mode = (row as any).mode || "risk";
        return (
          row.getValue() && (
            <div className="w-fit">
              {mode === "risk" ? (
                <CVERainbowBadge
                  low={row.row.original.risk.cvePurlLow}
                  medium={row.row.original.risk.cvePurlMedium}
                  high={row.row.original.risk.cvePurlHigh}
                  critical={row.row.original.risk.cvePurlCritical}
                />
              ) : (
                <CVERainbowBadge
                  low={row.row.original.risk.cvePurlLowCvss}
                  medium={row.row.original.risk.cvePurlMediumCvss}
                  high={row.row.original.risk.cvePurlHighCvss}
                  critical={row.row.original.risk.cvePurlCriticalCvss}
                />
              )}
            </div>
          )
        );
      },
    }),
  ];

const last3Month = new Date();
last3Month.setMonth(last3Month.getMonth() - 3);

const Index: FunctionComponent = () => {
  const searchParams = useSearchParams();
  const [mode, setMode] = useViewMode("devguard-view-mode");
  const releaseId = searchParams?.get("releaseId") || undefined; // todo.. is this okay?

  const { organizationSlug, projectSlug } = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
  };

  const organization = useOrganization();

  const { data: release } = useSWR<ReleaseDTO>(
    () =>
      releaseId
        ? `/organizations/${organizationSlug}/projects/${projectSlug}/releases/${releaseId}`
        : null,
    fetcher,
  );

  // fetch all the data
  const { data: riskHistory, isLoading: riskHistoryLoading } = useSWR<
    RiskHistory[]
  >(
    () =>
      releaseId
        ? `/organizations/${organizationSlug}/projects/${projectSlug}/releases/${releaseId}/stats/risk-history?start=${last3Month.toISOString().split("T")[0]}&end=${new Date().toISOString().split("T")[0]}`
        : null,
    fetcher,
  );

  const latestArtifactRisks: { risk: RiskHistory; release: ReleaseDTO }[] =
    useMemo(() => {
      if (release === undefined) {
        return [];
      }

      const data = (riskHistory ?? []).map((r) => ({ ...r, ...release }));
      const groups = groupBy(data, "day");
      const days = Object.keys(groups).sort();

      if (days.length === 0) {
        return [];
      }

      const latestRiskHistory = groups[days[days.length - 1]]; // get last day

      const sorter = sortRisk(mode);
      const sorted = [...latestRiskHistory].sort(sorter);

      // Add Release Infos
      const latestRiskHistoryWithRelease = sorted.map((r) => ({
        risk: r,
        release: release,
      }));

      return latestRiskHistoryWithRelease;
    }, [riskHistory, release, mode]);

  const router = useRouter();
  organizationSlug;

  const { table } = useTable({
    data: (latestArtifactRisks ?? []) as Array<{
      risk: RiskHistory;
      release: ReleaseDTO;
    }>,
    columnsDef,
  });

  return (
    <Page
      title="Artifacts"
      description="Artifacts of the Release"
      Title={<AssetTitle />}
    >
      <Section
        primaryHeadline
        forceVertical
        description="Artifacts of the Release"
        title="Artifacts"
      >
        <Tabs
          value={mode}
          onValueChange={(value) => setMode(value as "risk" | "cvss")}
          className="w-full"
        >
          <div className="mb-0 flex">
            <TabsList>
              <TabsTrigger value="risk">Risk values</TabsTrigger>
              <TabsTrigger value="cvss">CVSS values</TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
        <div className="overflow-hidden rounded-lg border shadow-sm">
          <table className="w-full table-fixed overflow-x-auto text-sm">
            <thead className="border-b bg-card text-foreground">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      className="cursor-pointer break-normal p-4 text-left"
                      key={header.id}
                    >
                      <div
                        className="flex flex-row gap-2"
                        onClick={header.column.getToggleSortingHandler()}
                        /* todo.. not working */
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        <SortingCaret
                          sortDirection={header.column.getIsSorted()}
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {riskHistoryLoading &&
                Array.from(Array(10).keys()).map((el, i, arr) => (
                  <tr
                    className={classNames(
                      "relative cursor-pointer align-top transition-all",
                      i === arr.length - 1 ? "" : "border-b",
                      i % 2 !== 0 && "bg-card/50",
                    )}
                    key={el}
                  >
                    <td className="p-4">
                      <Skeleton className="w-2/3 h-[20px]" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="w-1/2 h-[20px]" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="w-1/2 h-[20px]" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="w-full h-[40px]" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="w-1/2 h-[20px]" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="w-1/2 h-[20px]" />
                    </td>
                  </tr>
                ))}
              {table.getRowModel().rows.map((row, index, arr) => (
                <tr
                  className={classNames(
                    "relative cursor-pointer bg-background align-top transition-all ",
                    index === arr.length - 1 ? "" : "border-b",
                    index % 2 != 0 && "bg-card/50",
                  )}
                  key={row.original.risk.assetId}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      className="p-4"
                      key={cell.id}
                      onClick={() => {
                        const data = row.original;
                        try {
                          const redirect = new RedirectorBuilder()
                            .setOrganizationSlug(organizationSlug)
                            .setProjectSlug(projectSlug)
                            .setAssetId(data.risk.assetId)
                            .setAssetVersionName(data.risk.assetVersionName)
                            .setContentTree(organization.contentTree)
                            .build();
                          router.push(redirect);
                        } catch (error) {
                          toast.error((error as Error).message);
                        }
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, {
                        ...cell.getContext(),
                        mode,
                      })}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  );
};

export default Index;
