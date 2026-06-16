"use client";

import SortingCaret from "@/components/common/SortingCaret";
import { useAssetMenu } from "@/hooks/useAssetMenu";

import Page from "@/components/Page";
import type {
  ComplianceRiskDTO,
  Paged,
  PolicyFrameworks,
} from "@/types/api/api";
import { createColumnHelper, flexRender } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import type { FunctionComponent } from "react";

import { classNames } from "@/utils/common";

import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import ColoredBadge from "@/components/common/ColoredBadge";
import CustomPagination from "@/components/common/CustomPagination";
import EmptyParty from "@/components/common/EmptyParty";
import Section from "@/components/common/Section";
import Filter from "@/components/Filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/data-fetcher/fetcher";
import { useAssetBranchesAndTags } from "@/hooks/useActiveAssetVersion";
import useDebouncedQuerySearch from "@/hooks/useDebouncedQuerySearch";
import useDecodedParams from "@/hooks/useDecodedParams";
import useTable from "@/hooks/useTable";
import { buildFilterSearchParams } from "@/utils/url";
import { violationLengthToLevel } from "@/utils/view";
import { Loader2, Download } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import useSWR from "swr";
import FrameworkSelect from "./FrameworkSelect";

const columnHelper = createColumnHelper<ComplianceRiskDTO>();

// Sorting is disabled on every column: the backend only applies a default
// open-first ordering and ignores per-column sort params for now.
const columnsDef: ColumnDef<ComplianceRiskDTO, any>[] = [
  columnHelper.accessor("policyTitle", {
    header: "Policy",
    id: "policy_title",
    enableSorting: false,
    cell: (info) => (
      <div className="flex flex-col">
        <span className="font-medium">{info.getValue()}</span>
        {info.row.original.policyDescription && (
          <span className="line-clamp-1 text-xs text-muted-foreground">
            {info.row.original.policyDescription}
          </span>
        )}
      </div>
    ),
  }),
  columnHelper.accessor("policyFrameworks", {
    header: "Frameworks",
    id: "policy_frameworks",
    enableSorting: false,
    cell: (info) => {
      const frameworks = info.getValue() ?? [];
      if (!frameworks.length) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <div className="flex flex-row flex-wrap gap-1">
          {frameworks.map((f: PolicyFrameworks) => (
            <Badge
              key={f.framework}
              variant="secondary"
              className="whitespace-nowrap"
            >
              {f.framework}
            </Badge>
          ))}
        </div>
      );
    },
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
  columnHelper.accessor("violations", {
    header: "Violations",
    id: "violations",
    enableSorting: false,
    cell: (info) => {
      const count = info.getValue()?.length ?? 0;
      return (
        <ColoredBadge variant={violationLengthToLevel(count)}>
          {count} {count === 1 ? "violation" : "violations"}
        </ColoredBadge>
      );
    },
  }),
  columnHelper.accessor("createdAt", {
    header: "Created",
    id: "created_at",
    enableSorting: false,
    cell: (info) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {info.getValue()
          ? new Date(info.getValue() as string).toLocaleDateString()
          : "—"}
      </span>
    ),
  }),
];

const Index: FunctionComponent = () => {
  const router = useRouter();

  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    useDecodedParams() as {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
    };

  const searchParams = useSearchParams();

  // The URL is the single source of truth: search, Filter chips and the
  // framework dropdown all write independent filterQuery/search params, and
  // buildFilterSearchParams forwards page/pageSize/search/filterQuery[...] (incl.
  // the framework filter) to the backend. Open + closed risks come back
  // together, open-first.
  const query = useMemo(
    () => buildFilterSearchParams(searchParams),
    [searchParams],
  );

  const uri =
    "/organizations/" +
    organizationSlug +
    "/projects/" +
    projectSlug +
    "/assets/" +
    assetSlug +
    "/";

  const { data: vulns, isLoading } = useSWR<
    Paged<ComplianceRiskDTO> & { frameworks: string[] }
  >(
    uri + "refs/" + assetVersionSlug + "/compliance-risks/?" + query.toString(),
    fetcher,
    {
      keepPreviousData: true,
    },
  );

  // NOTE: filter `value`s map to the backend's filterable columns
  // (filterQuery[<value>][<op>]). The "Framework" option uses the JSONB
  // `frameworkContains` operator; it also gives the framework dropdown's
  // selection a human-readable native chip label.
  const filterOptions = useMemo(() => {
    return [
      {
        label: "Policy",
        value: "policy_title",
        operators: [
          { value: "ilike", label: "contains" },
          { value: "is" },
          { value: "is not" },
        ],
      },
      {
        // Driven by the dedicated FrameworkSelect dropdown, not the builder —
        // hidden from the field list but still used for the native chip label.
        label: "Framework",
        value: "policyFrameworks",
        operators: [{ value: "frameworkContains", label: "is" }],
        hidden: true,
      },
    ];
  }, []);

  const { table, handleFilter, removeFilter, clearAllFilters } = useTable({
    columnsDef,
    data: vulns?.data || [],
  });

  const handleSearch = useDebouncedQuerySearch();

  const assetMenu = useAssetMenu();

  const { branches, tags } = useAssetBranchesAndTags();

  const params = useSearchParams();
  const pathname = usePathname();

  return (
    <Page Menu={assetMenu} title={"Compliance"} Title={<AssetTitle />}>
      <div className="flex flex-row items-center justify-between">
        <BranchTagSelector branches={branches} tags={tags} />
        <Button variant={"secondary"} onClick={() => alert("Share your VEX")}>
          <Download className="mr-2 h-4 w-4" />
          Export OSCAL
        </Button>
      </div>
      <Section
        forceVertical
        primaryHeadline
        title="Identified Compliance Risks"
        description="This table shows all the identified compliance risks for this repository."
        className="mb-4 mt-4"
      >
        <div className="relative flex flex-col gap-2">
          <div className="flex flex-row items-center gap-2">
            <div className="flex-1 space-y-2">
              <FrameworkSelect frameworks={vulns?.frameworks ?? []} />
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
            description="Risk identification is the process of determining what risks exist in the asset and what their characteristics are. This process is done by identifying, assessing, and prioritizing risks."
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
                          router?.push(pathname + "/" + row.original.id)
                        }
                        className={classNames(
                          "relative cursor-pointer align-top transition-all",
                          i === arr.length - 1 ? "" : "border-b",
                          i % 2 != 0 && "bg-card/50",
                          "hover:bg-muted",
                        )}
                        key={row.original.id}
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

export default Index;
