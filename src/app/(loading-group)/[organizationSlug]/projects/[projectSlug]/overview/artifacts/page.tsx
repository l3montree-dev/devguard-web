"use client";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { browserApiClient } from "@/services/devGuardApi";
import "@xyflow/react/dist/style.css";
import { ChangeEvent, FunctionComponent, useMemo, useState } from "react";
import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import CustomPagination from "@/components/common/CustomPagination";
import EcosystemImage from "@/components/common/EcosystemImage";
import Section from "@/components/common/Section";
import {
  useActiveAssetVersion,
  useAssetBranchesAndTags,
} from "@/hooks/useActiveAssetVersion";
import useTable from "@/hooks/useTable";
import {
  ArtifactDTO,
  Component,
  ComponentPaged,
  License,
  LicenseResponse,
  Paged,
  ReleaseDTO,
  RiskHistory,
  ScoreCard,
} from "@/types/api/api";
import { beautifyPurl, classNames, licenses } from "@/utils/common";
import { buildFilterSearchParams } from "@/utils/url";
import {
  CalendarDateRangeIcon,
  CheckBadgeIcon,
  ScaleIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { ChevronDownIcon, GitBranch, Loader2 } from "lucide-react";
import Link from "next/link";
import DateString from "../../../../../../../components/common/DateString";
import SortingCaret from "../../../../../../../components/common/SortingCaret";
import { Badge } from "../../../../../../../components/ui/badge";
import {
  AsyncButton,
  Button,
  buttonVariants,
} from "../../../../../../../components/ui/button";
import { useActiveAsset } from "../../../../../../../hooks/useActiveAsset";
import { useActiveProject } from "../../../../../../../hooks/useActiveProject";
import Page from "@/components/Page";
import { Combobox } from "@/components/common/Combobox";
import { useRouter } from "next/navigation";
import DependencyDialog from "../../../../../../../components/DependencyDialog";
import OpenSsfScore from "../../../../../../../components/common/OpenSsfScore";
import { QueryArtifactSelector } from "@/components/ArtifactSelector";
import SbomDownloadModal from "@/components/dependencies/SbomDownloadModal";
import VexDownloadModal from "@/components/dependencies/VexDownloadModal";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { debounce, groupBy } from "lodash";
import { GitBranchIcon, Loader2Icon } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import useSWR from "swr";
import { useArtifacts } from "../../../../../../../context/AssetVersionContext";
import { fetcher } from "../../../../../../../data-fetcher/fetcher";
import useDecodedParams from "../../../../../../../hooks/useDecodedParams";
import useRouterQuery from "../../../../../../../hooks/useRouterQuery";
import { ContentTreeElement, osiLicenseHexColors, RedirectorBuilder, sortRisk } from "../../../../../../../utils/view";
import { Skeleton } from "../../../../../../../components/ui/skeleton";
import { useViewMode } from "@/hooks/useViewMode";
import CVERainbowBadge from "@/components/CVERainbowBadge";
import { useOrganization } from "@/context/OrganizationContext";

const columnHelper = createColumnHelper<{ risk: RiskHistory, release: ReleaseDTO }>();

const columnsDef: ColumnDef<
  { risk: RiskHistory, release: ReleaseDTO },
  any
>[] = [
    columnHelper.accessor("risk.artifactName", {
      header: "Artifact",
      id: "artifact_name",
      cell: (row) => (
        <span className="flex flex-row items-start gap-2">
          {beautifyPurl(row.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor(row => row.risk, {
      header: "Score",
      id: "critical",
      cell: (row) =>
        row.getValue() && <div className="w-fit"><CVERainbowBadge
          low={row.getValue().low ?? 0}
          medium={row.getValue().medium ?? 0}
          high={row.getValue().high ?? 0}
          critical={row.getValue().critical ?? 0}
        /></div>,
    }),
  ];

const last3Month = new Date();
last3Month.setMonth(last3Month.getMonth() - 3);

const Index: FunctionComponent = () => {
  const searchParams = useSearchParams();
  const [mode, setMode] = useViewMode("devguard-view-mode");
  const releaseId = searchParams?.get("releaseId") || undefined; // todo.. is this okay?

  const { organizationSlug, projectSlug } =
    useDecodedParams() as {
      organizationSlug: string;
      projectSlug: string;
    };

  const organization = useOrganization();

  const { data: release } = useSWR<ReleaseDTO>(
    () =>
      releaseId ? `/organizations/${organizationSlug}/projects/${projectSlug}/releases/${releaseId}`
        : null,
    fetcher,
  );

  // fetch all the data
  const { data: riskHistory, isLoading: riskHistoryLoading } = useSWR<RiskHistory[]>(
    () =>
      releaseId
        ? `/organizations/${organizationSlug}/projects/${projectSlug}/releases/${releaseId}/stats/risk-history?start=${last3Month.toISOString().split("T")[0]}&end=${new Date().toISOString().split("T")[0]}`
        : null,
    fetcher,
  );

  const latestArtifactRisks: ({ risk: RiskHistory, release: ReleaseDTO })[] = useMemo(() => {
    if (release === undefined) {
      return [];
    }

    const data = (riskHistory ?? []).map((r) => ({ ...r, ...release }));
    const groups = groupBy(data, "day");
    const days = Object.keys(groups).sort();

    if (days.length === 0) {
      return [];
    }

    const latestRiskHistory = groups[days[days.length - 1]] // get last day

    const sorter = sortRisk(mode);
    const sorted = [...latestRiskHistory].sort(sorter);

    // Add Release Infos
    const latestRiskHistoryWithRelease = sorted.map((r) => ({ risk: r, release: release }));

    return latestRiskHistoryWithRelease;
  }, [riskHistory, release]);

  const router = useRouter();
  organizationSlug

  const { table } = useTable({
    data: (latestArtifactRisks ?? []) as Array<{ risk: RiskHistory, release: ReleaseDTO }>,
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
                    <td className="p-4" key={cell.id} onClick={() => {
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
                    }}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* {latestArtifactRisks && <CustomPagination {...latestArtifactRisks} />} */}
      </Section>
    </Page>
  );
};


export default Index;
