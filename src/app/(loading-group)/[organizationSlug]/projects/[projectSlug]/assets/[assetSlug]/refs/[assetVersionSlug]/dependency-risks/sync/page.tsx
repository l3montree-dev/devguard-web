"use client";
import AssetTitle from "@/components/common/AssetTitle";
import { FunctionComponent, use, useEffect, useMemo, useState } from "react";
import Page from "@/components/Page";
import {
  DependencyVuln,
  DetailedDependencyVulnDTO,
  Paged,
  VulnByPackage,
  VulnWithCVE,
} from "@/types/api/api";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { BranchTagSelector } from "@/components/BranchTagSelector";
import { useAssetBranchesAndTags } from "@/hooks/useActiveAssetVersion";
import { QueryArtifactSelector } from "@/components/ArtifactSelector";
import { useArtifacts } from "@/context/AssetVersionContext";
import EcosystemImage from "@/components/common/EcosystemImage";
import Severity from "@/components/common/Severity";
import { beautifyPurl, classNames, extractVersion } from "@/utils/common";
import {
  createColumnHelper,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "@/data-fetcher/fetcher";
import CustomPagination from "@/components/common/CustomPagination";
import EmptyParty from "@/components/common/EmptyParty";
import SortingCaret from "@/components/common/SortingCaret";
import RiskHandlingRow from "@/components/risk-handling/RiskHandlingRow";
import useTable from "@/hooks/useTable";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CircleHelp } from "lucide-react";

import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { buildFilterSearchParams } from "@/utils/url";
import { useSearchParams } from "next/navigation";
import useDecodedParams from "@/hooks/useDecodedParams";
import RiskSync from "@/components/risk-handling/RiskSync";

const columnHelper = createColumnHelper<DetailedDependencyVulnDTO>();

const columnsDef: ColumnDef<DetailedDependencyVulnDTO, any>[] = [
  {
    ...columnHelper.accessor("cveID", {
      header: "CVE ID",
      cell: (row) => <span>{row.getValue()}</span>,
    }),
  },
  {
    header: "CVSS",
    id: "cvss",
    enableSorting: false,
    cell: ({ row }: any) => (
      <div className="flex flex-row justify-start">
        <Severity gray risk={row.original.cve.cvss ?? 0} />
      </div>
    ),
  },
  {
    ...columnHelper.accessor("componentPurl", {
      header: "Package",
      id: "packageName",
      cell: (row) => (
        <span className="flex flex-row gap-2">
          <div className="flex h-5 w-5 flex-row items-center justify-center">
            <EcosystemImage packageName={row.getValue()} />
          </div>
          <div className="flex-1">{beautifyPurl(row.getValue())}</div>
        </span>
      ),
    }),
  },
  {
    header: "Installed Version",
    id: "installed",
    enableSorting: false,
    cell: ({ row }: any) => (
      <span>
        <Badge variant={"secondary"}>
          {extractVersion((row.original as VulnWithCVE).componentPurl)}
        </Badge>
      </span>
    ),
  },
];

const Index: FunctionComponent = () => {
  const assetMenu = useAssetMenu();
  const { branches, tags } = useAssetBranchesAndTags();
  const artifacts = useArtifacts();

  const [vulnsToUpdate, setVulnsToUpdate] = useState<string[]>([]);

  let { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    useDecodedParams() as {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
    };

  const searchParams = useSearchParams();

  const query = useMemo(() => {
    const p = buildFilterSearchParams(searchParams);

    if (searchParams?.has("artifact")) {
      p.append(
        "filterQuery[artifact_dependency_vulns.artifact_artifact_name][is]",
        searchParams.get("artifact") as string,
      );
    }

    return p;
  }, [searchParams]);

  const uri =
    "/organizations/" +
    organizationSlug +
    "/projects/" +
    projectSlug +
    "/assets/" +
    assetSlug +
    "/";

  const {
    data: vulns,
    isLoading,
    error,
  } = useSWR<Paged<DetailedDependencyVulnDTO>>(
    uri +
      "refs/" +
      assetVersionSlug +
      "/" +
      "dependency-vulns/sync/?" +
      query.toString(),
    fetcher,
  );

  console.log("vulns", vulns);

  useEffect(() => {
    if (vulns?.data) {
      setVulnsToUpdate(vulns.data.map((v) => v.id));
    }
  }, [vulns?.data]);

  const { table } = useTable({
    columnsDef,
    data: vulns?.data || [],
  });

  return (
    <Page Menu={assetMenu} title={"Risk Handling"} Title={<AssetTitle />}>
      <div className="flex flex-row items-center justify-between">
        <BranchTagSelector branches={branches} tags={tags} />
      </div>
      <div className="relative flex flex-row gap-2">
        <QueryArtifactSelector
          unassignPossible
          artifacts={artifacts.map((a) => a.artifactName)}
        />
      </div>
      {!vulns?.data?.length ? (
        <div>
          <EmptyParty
            title="No matching results."
            description="Risk identification is the process of determining what risks exist in the asset and what their characteristics are. This process is done by identifying, assessing, and prioritizing risks."
          />
          <div className="mt-4">{vulns && <CustomPagination {...vulns} />}</div>
        </div>
      ) : (
        <div>
          <div className="overflow-hidden rounded-lg border shadow-sm">
            <div className="overflow-auto">
              <table className="w-full table-fixed overflow-x-auto text-sm">
                <thead className="border-b bg-card text-foreground">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      <th className="w-6" />
                      {headerGroup.headers.map((header) => (
                        <th
                          className="w-40 cursor-pointer break-normal p-4 text-left"
                          onClick={
                            header.column.columnDef.enableSorting
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                          key={header.id}
                        >
                          <div className="flex flex-row items-center gap-2">
                            {header.isPlaceholder ? null : header.id ===
                              "fixAvailable" ? (
                              <Badge className="">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                              </Badge>
                            ) : (
                              <div>
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                              </div>
                            )}
                            {header.isPlaceholder ? null : header.id ===
                              "max_risk" ? (
                              <Tooltip>
                                <TooltipTrigger>
                                  <CircleHelp className=" w-4 h-4 text-gray-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="relative font-normal">
                                    Risk Value is a context-aware score that
                                    adjusts the CVSS by factoring in real-world
                                    exploitability and system relevance. It
                                    reflects the{" "}
                                    <span className=" font-bold">
                                      actual risk a vulnerability poses
                                    </span>
                                    , not just its theoretical severity.
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ) : null}
                            <SortingCaret
                              sortDirection={header.column.getIsSorted()}
                            />
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="text-sm text-foreground">
                  {isLoading &&
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
                          <Skeleton className="w-full h-[20px]" />
                        </td>
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
                          <Skeleton className="w-1/2 h-[20px]" />
                        </td>
                        <td className="p-4">
                          <Skeleton className="w-full h-[40px]" />
                        </td>
                      </tr>
                    ))}
                  {table.getRowModel().rows.map((row, i, arr) => (
                    <RiskSync
                      row={row}
                      index={i}
                      arrLength={arr.length}
                      vulnsToUpdate={vulnsToUpdate}
                      setVulnsToUpdate={setVulnsToUpdate}
                      key={row.original.cveID}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4">{vulns && <CustomPagination {...vulns} />}</div>
        </div>
      )}
    </Page>
  );
};
export default Index;
