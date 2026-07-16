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
import { DelayedDownloadButton } from "../common/DelayedDownloadButton";
import OscalDownloadModal from "./OscalDownloadModal";
import { useState } from "react";
import { FlatBadge } from "../common/Severity";
import { importanceVariant } from "./CompliancePostureDetailView";

const columnHelper = createColumnHelper<CompliancePostureWithControlDTO>();

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

  const activeFrameworkFilter = useMemo(() => {
    if (!searchParams) return null;
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("filterQuery[framework]")) return value;
    }
    return null;
  }, [searchParams]);

  const columnsDef: ColumnDef<CompliancePostureWithControlDTO, any>[] = useMemo(
    () => [
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
      columnHelper.accessor("mappedControls", {
        header: "Mapped Controls",
        id: "mapped_controls",
        enableSorting: false,
        cell: (info) => {
          const controls = info.getValue() ?? [];
          if (!controls.length) return null;
          const sorted = (
            activeFrameworkFilter
              ? [...controls].sort((a, b) => {
                  const aMatch =
                    a.relatedFramework === activeFrameworkFilter ? -1 : 0;
                  const bMatch =
                    b.relatedFramework === activeFrameworkFilter ? -1 : 0;
                  return aMatch - bMatch;
                })
              : controls
          ).slice(0, 5);
          const remaining = controls.length - sorted.length;
          return (
            <div className="flex flex-wrap gap-1">
              {sorted.map(
                (c: { relatedFramework: string; relatedControlId: string }) => {
                  const label = `${c.relatedFramework}:${c.relatedControlId}`;
                  const isActive =
                    activeFrameworkFilter &&
                    c.relatedFramework === activeFrameworkFilter;
                  return (
                    <Badge
                      key={label}
                      variant={isActive ? "secondary" : "outline"}
                      className="whitespace-nowrap font-mono text-xs"
                    >
                      {label}
                    </Badge>
                  );
                },
              )}
              {remaining > 0 && (
                <Badge variant="outline" className="whitespace-nowrap text-xs">
                  +{remaining} more
                </Badge>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("importance", {
        header: "Importance",
        id: "importance",
        cell: (info) =>
          info.getValue() === "" ? null : (
            <div className="flex">
              <FlatBadge variant={importanceVariant(info.getValue())}>
                {info.getValue()}
              </FlatBadge>
            </div>
          ),
      }),
    ],
    [activeFrameworkFilter],
  );

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
    Paged<CompliancePostureWithControlDTO> & { frameworks: string[] }
  >(apiBaseUrl + "?" + query.toString(), fetcher, { keepPreviousData: false });

  const { data: stats, isLoading: statsLoading } = useSWR<{
    open: number;
    implemented: number;
    notApplicable: number;
  }>(apiBaseUrl + "stats/" + "?" + query.toString(), fetcher);

  const isClosed = searchParams?.get("state") === "closed";

  const { table, handleFilter, removeFilter, clearAllFilters } = useTable({
    columnsDef,
    data: vulns?.data || [],
  });

  const removeFilterAndClearStorage = (f: any) => {
    localStorage.removeItem("compliance-framework-filter");
    removeFilter(f);
  };
  const clearAllFiltersAndClearStorage = () => {
    localStorage.removeItem("compliance-framework-filter");
    clearAllFilters();
  };
  const handleSearch = useDebouncedQuerySearch();

  const { branches, tags } = useAssetBranchesAndTags();
  const [showOscalModal, setShowOscalModal] = useState(false);

  const params = useSearchParams();
  const pathname = usePathname();
  const push = useRouterQuery();

  const frameworks = useMemo(
    () => vulns?.frameworks ?? [],
    [vulns?.frameworks],
  );

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
      {
        label: "Importance",
        value: "importance",
        operators: [{ value: "ilike", label: "is" }],
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

  return (
    <Page Menu={Menu} title={"Compliance Postures"} Title={Title}>
      <div className="flex flex-row items-center justify-between">
        {asset && <BranchTagSelector branches={branches} tags={tags} />}
        <div className={"ml-auto"}>
          <Button
            variant="secondary"
            onClick={() => setShowOscalModal(true)}
            data-testid="download-oscal-format"
          >
            <Download className="mr-2 h-4 w-4" />
            Download OSCAL
          </Button>
        </div>
      </div>
      <OscalDownloadModal
        open={showOscalModal}
        setOpen={setShowOscalModal}
        oscalBaseUrl={`/api/devguard-tunnel/api/v1/` + apiBaseUrl + `oscal/`}
        frameworks={frameworks}
      />
      <Section
        forceVertical
        primaryHeadline
        title="Compliance Postures Assessment"
        description="This table shows the compliance postures."
        className="mb-4 mt-4"
      >
        <div className="relative flex flex-col gap-2">
          <FrameworkSelect frameworks={frameworks} />
          <ComplianceStats
            open={stats?.open ?? 0}
            implemented={stats?.implemented ?? 0}
            notApplicable={stats?.notApplicable ?? 0}
            isLoading={statsLoading}
          />

          <Tabs value={params?.get("state") ?? "open"}>
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
              <Filter
                options={filterOptions}
                onFilter={handleFilter}
                onRemoveFilter={removeFilterAndClearStorage}
                onClearAllFilters={clearAllFiltersAndClearStorage}
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
