"use client";

import SortingCaret from "@/components/common/SortingCaret";
import Page from "@/components/Page";
import type { CompliancePostureWithControlDTO, Paged } from "@/types/api/api";
import { createColumnHelper, flexRender } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import type { FunctionComponent, ReactNode } from "react";

import { classNames } from "@/utils/common";

import { BranchTagSelector } from "@/components/BranchTagSelector";
import CustomPagination from "@/components/common/CustomPagination";
import EmptyParty from "@/components/common/EmptyParty";
import Section from "@/components/common/Section";
import Filter from "@/components/Filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetcher } from "@/data-fetcher/fetcher";
import { useAssetBranchesAndTags } from "@/hooks/useActiveAssetVersion";
import useDebouncedQuerySearch from "@/hooks/useDebouncedQuerySearch";
import useRouterQuery from "@/hooks/useRouterQuery";
import useTable from "@/hooks/useTable";
import { buildFilterSearchParams } from "@/utils/url";
import { Loader2, Download } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import useSWR from "swr";
import FrameworkSelect from "./FrameworkSelect";
import FrameworkIcon from "./FrameworkIcon";
import ComplianceStats from "./ComplianceStats";
import { useActiveAsset } from "@/hooks/useActiveAsset";

const columnHelper = createColumnHelper<CompliancePostureWithControlDTO>();

const columnsDef: ColumnDef<CompliancePostureWithControlDTO, any>[] = [
  columnHelper.accessor("title", {
    header: "Title",
    id: "title",
    enableSorting: true,
    cell: (info) => (
      <div className="flex flex-col">
        <span className="font-medium">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor("framework", {
    header: "Framework",
    id: "framework",
    enableSorting: true,
    cell: (info) => (
      <div className="flex flex-row items-center gap-2">
        <FrameworkIcon framework={info.getValue()} />
        <span>{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor("controlId", {
    header: "Control ID",
    id: "control_id",
    enableSorting: true,
    cell: (info) => (
      <Badge
        key={info.getValue()}
        variant="outline"
        className="whitespace-nowrap font-mono text-xs"
      >
        {info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor("state", {
    header: "State",
    id: "state",
    enableSorting: false,
    cell: (info) => (
      <Badge variant="outline" className="whitespace-nowrap capitalize">
        {info.getValue()}
      </Badge>
    ),
  }),
];

interface Props {
  apiBaseUrl: string;
  Menu?: any[];
  Title?: ReactNode;
}

const CompliancePosturesListView: FunctionComponent<Props> = ({
  apiBaseUrl,
  Menu,
  Title,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const asset = useActiveAsset();

  const query = useMemo(() => {
    const p = buildFilterSearchParams(searchParams);
    const state = searchParams?.get("state");
    if (!Boolean(state) || state === "open") {
      p.append("filterQuery[state][is]", "open");
    } else {
      p.append("filterQuery[state][is not]", "open");
    }
    return p;
  }, [searchParams]);

  const { data: vulns, isLoading } = useSWR<
    Paged<CompliancePostureWithControlDTO>
  >(apiBaseUrl + "?" + query.toString(), fetcher, { keepPreviousData: false });

  const { data: stats, isLoading: statsLoading } = useSWR<{
    open: number;
    implemented: number;
    notApplicable: number;
  }>(apiBaseUrl + "stats/", fetcher);

  const isClosed = searchParams?.get("state") === "closed";

  const { table, handleFilter, removeFilter, clearAllFilters } = useTable({
    columnsDef,
    data: vulns?.data || [],
  });
  const handleSearch = useDebouncedQuerySearch();

  const { branches, tags } = useAssetBranchesAndTags();

  const params = useSearchParams();
  const pathname = usePathname();
  const push = useRouterQuery();

  const frameworks = useMemo(() => {
    const result: string[] = [];
    vulns?.data.forEach((v) => {
      if (!result.includes(v.framework)) {
        result.push(v.framework);
      }
    });
    return result;
  }, [vulns?.data]);

  const filterOptions = useMemo(() => {
    return [
      {
        label: "Title",
        value: "title",
        operators: [{ value: "ilike", label: "contains" }],
      },
      {
        label: "Framework",
        value: "framework",
        operators: [
          { value: "is" },
          { value: "is not" },
          { value: "ilike", label: "contains" },
        ],
        filterValues: frameworks.map((f) => ({ value: f })),
      },
      {
        label: "Control ID",
        value: "controlId",
        operators: [
          { value: "is" },
          { value: "is not" },
          { value: "ilike", label: "contains" },
        ],
      },
      ...(isClosed
        ? [
            {
              label: "State",
              value: "state",
              operators: [{ value: "is" }],
              filterValues: [
                { value: "implemented", label: "Implemented" },
                { value: "notApplicable", label: "Not Applicable" },
              ],
            },
          ]
        : []),
    ];
  }, [isClosed, frameworks]);
  console.log("params state", params?.has("state"));

  return (
    <Page Menu={Menu} title={"Compliance Postures"} Title={Title}>
      <div className="flex flex-row items-center justify-between">
        {asset && <BranchTagSelector branches={branches} tags={tags} />}
        <div className={"ml-auto"}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button variant={"secondary"} disabled>
                    <Download className="mr-2 h-4 w-4" />
                    Export OSCAL
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Coming soon</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <Section
        forceVertical
        primaryHeadline
        title="Compliance Postures Assessment"
        description="This table shows the compliance postures."
        className="mb-4 mt-4"
      >
        <div className="relative flex flex-col gap-2">
          <ComplianceStats
            open={stats?.open ?? 0}
            implemented={stats?.implemented ?? 0}
            notApplicable={stats?.notApplicable ?? 0}
            isLoading={statsLoading}
          />

          <Tabs
            defaultValue={
              params?.has("state") ? (params.get("state") as string) : "open"
            }
          >
            <TabsList>
              <TabsTrigger onClick={() => push({ state: "open" })} value="open">
                Open
              </TabsTrigger>
              <TabsTrigger
                onClick={() => push({ state: "closed" })}
                value="closed"
              >
                Resolved
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex flex-row items-center gap-2">
            <div className="flex-1 space-y-2">
              <FrameworkSelect frameworks={frameworks} />
              <Filter
                options={filterOptions}
                onFilter={handleFilter}
                onRemoveFilter={removeFilter}
                onClearAllFilters={clearAllFilters}
                search={{
                  onChange: handleSearch,
                  defaultValue: params?.get("search") ?? "",
                  placeholder: "Search or filter results...",
                }}
              />
            </div>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 ">
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
      </Section>
      {!vulns?.data.length ? (
        <div>
          <EmptyParty
            title="No matching results."
            description="Try adjusting your search or filter to find what you're looking for."
          />
          <div className="mt-4">{vulns && <CustomPagination {...vulns} />}</div>
        </div>
      ) : (
        <div>
          <div>
            <div className="overflow-hidden rounded-lg border shadow-sm">
              <div className="overflow-auto">
                <table className="w-full overflow-x-auto text-sm">
                  <thead className="border-b bg-card text-foreground">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            className="cursor-pointer whitespace-nowrap break-normal p-4 text-left"
                            onClick={
                              header.column.columnDef.enableSorting
                                ? header.column.getToggleSortingHandler()
                                : undefined
                            }
                            key={header.id}
                          >
                            <div className="flex flex-row items-center gap-2">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                              {header.column.columnDef.enableSorting && (
                                <SortingCaret
                                  sortDirection={header.column.getIsSorted()}
                                />
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="text-sm text-foreground">
                    {isLoading &&
                      vulns?.data.length === 0 &&
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
                            <Skeleton className="w-1/2 h-[20px]" />
                          </td>
                          <td className="p-4">
                            <Skeleton className="w-full h-[20px]" />
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
                        </tr>
                      ))}
                    {table.getRowModel().rows.map((row, i, arr) => (
                      <tr
                        onClick={() =>
                          router?.push(
                            pathname + "/" + row.original.frameworkControlId,
                          )
                        }
                        className={classNames(
                          "relative cursor-pointer align-center transition-all",
                          i === arr.length - 1 ? "" : "border-b",
                          i % 2 != 0 && "bg-card/50",
                          "hover:bg-muted",
                        )}
                        key={row.original.frameworkControlId}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td className="p-4" key={cell.id}>
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
            </div>
            <div className="mt-4">
              {vulns && <CustomPagination {...vulns} />}
            </div>
          </div>
        </div>
      )}
    </Page>
  );
};

export default CompliancePosturesListView;
