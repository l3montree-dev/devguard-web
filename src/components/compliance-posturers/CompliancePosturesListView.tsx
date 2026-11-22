// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import SortingCaret from "@/components/common/SortingCaret";
import Page from "@/components/Page";
import type { CompliancePostureWithControlDTO } from "@/types/dto";
import { flexRender } from "@tanstack/react-table";

import { useRouter } from "next/navigation";
import { uniqBy } from "lodash";
import { useMemo } from "react";
import type { FunctionComponent } from "react";
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
import { TUNNEL_BASE_URL } from "@/services/apiClient";
import type { PostureScope } from "@/services/compliancePostureService";
import {
  postureBaseUrl,
  toComplianceScope,
} from "@/services/compliancePostureService";
import {
  useComplianceComponents,
  useCompliancePostures,
} from "@/hooks/useCompliancePostures";
import { useAssetBranchesAndTags } from "@/hooks/useActiveAssetVersion";
import useDebouncedQuerySearch from "@/hooks/useDebouncedQuerySearch";
import useRouterQuery from "@/hooks/useRouterQuery";
import useTable from "@/hooks/useTable";
import { createAppColumnHelper } from "@/hooks/useTable";
import type { TableColumnDef } from "@/hooks/useTable";
import { buildFilterSearchParams } from "@/utils/url";
import { Loader2, Download, Library } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import FrameworkSelect from "./FrameworkSelect";
import FrameworkIcon from "./FrameworkIcon";
import ComplianceStats from "./ComplianceStats";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import OscalDownloadModal from "./OscalDownloadModal";
import ComplianceDocumentsModal from "./ComplianceDocumentsModal";
import type { ComplianceDocumentsTab } from "./ComplianceDocumentsModal";
import { useState } from "react";
import { FlatBadge } from "../common/Severity";
import { importanceVariant } from "./CompliancePostureDetailView";
import ComplianceComponentIcon from "./ComplianceComponentIcon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const columnHelper = createAppColumnHelper<CompliancePostureWithControlDTO>();

interface Props {
  scope: PostureScope;
  contextName: string;
}

const CompliancePosturesListView: FunctionComponent<Props> = ({
  scope,
  contextName,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const asset = useActiveAsset();

  const { data: components } = useComplianceComponents(
    toComplianceScope(scope),
  );

  const componentsByControl = useMemo(() => {
    const map = new Map<
      string,
      { id: string; title: string; description: string }[]
    >();
    for (const component of components ?? []) {
      for (const ic of component.implementedControls) {
        const existing = map.get(ic.frameworkControlId) ?? [];
        existing.push({
          id: component.id,
          title: component.title,
          description: ic.description,
        });
        map.set(ic.frameworkControlId, existing);
      }
    }
    return map;
  }, [components]);

  const columnsDef: TableColumnDef<CompliancePostureWithControlDTO, any>[] =
    useMemo(
      () => [
        columnHelper.accessor("title", {
          header: "Title",
          id: "title",
          enableSorting: true,
          cell: (info) => (
            <div className="flex flex-col">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium text-left">
                    {info.getValue()}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="font-normal">
                    {info.row.original.description}
                  </span>
                </TooltipContent>
              </Tooltip>
            </div>
          ),
        }),
        columnHelper.accessor("frameworks", {
          header: "Framework",
          id: "frameworks",
          enableSorting: true,
          cell: (info) => (
            <div className="flex flex-col gap-1">
              {(info.getValue() ?? []).map((framework: string) => (
                <div
                  key={framework}
                  className="flex flex-row items-center gap-2"
                >
                  <FrameworkIcon framework={framework} />
                  <span className="whitespace-nowrap">{framework}</span>
                </div>
              ))}
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

        columnHelper.accessor("securityLevel", {
          header: "Security Level",
          id: "security_level",
          cell: (info) =>
            info.getValue() === "" ? null : (
              <div className="flex">
                <FlatBadge variant={importanceVariant(info.getValue())}>
                  {info.getValue()}
                </FlatBadge>
              </div>
            ),
        }),
        columnHelper.accessor("frameworkControlIds", {
          header: "Component",
          id: "component",
          enableSorting: false,
          cell: (info) => {
            const solvingComponents = uniqBy(
              (info.getValue() as string[]).flatMap(
                (frameworkControlId) =>
                  componentsByControl.get(frameworkControlId) ?? [],
              ),
              "id",
            );
            if (!solvingComponents.length) {
              return <span className="text-muted-foreground"></span>;
            }
            return (
              <div className="flex flex-row flex-wrap gap-1">
                {solvingComponents.map((c) => (
                  <Tooltip key={c.id}>
                    <TooltipTrigger onClick={(e) => e.stopPropagation()}>
                      <Badge
                        variant="outline"
                        className="flex flex-row items-center gap-1.5 whitespace-nowrap"
                      >
                        <ComplianceComponentIcon title={c.title} size="sm" />
                        {c.title}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="font-semibold">{c.title}</span>
                      {c.description ? `: ${c.description}` : ""}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            );
          },
        }),
      ],

      [componentsByControl],
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

  const {
    postures: { data: vulns, isLoading, mutate: mutatePostures },
    stats: { data: stats, isLoading: statsLoading, mutate: mutateStats },
  } = useCompliancePostures(scope, query);

  const isClosed = searchParams?.get("state") === "closed";

  const { table, handleFilter, removeFilter, clearAllFilters } = useTable({
    columnsDef,
    data: vulns?.data || [],
  });

  const handleSearch = useDebouncedQuerySearch();

  const { branches, tags } = useAssetBranchesAndTags();
  const [showOscalModal, setShowOscalModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [documentsTab, setDocumentsTab] =
    useState<ComplianceDocumentsTab>("catalogs");
  const openDocumentsModal = (tab: ComplianceDocumentsTab) => {
    setDocumentsTab(tab);
    setShowDocumentsModal(true);
  };

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
        value: "control_id",
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
      {
        label: "Solvable by Component",
        value: "has_component_coverage",
        operators: [{ value: "is" }],
        filterValues: [
          { value: "true", label: "Yes" },
          { value: "false", label: "No" },
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

  return (
    <Page title={"Compliance Postures (" + contextName + ")"}>
      <div className="flex flex-row items-center justify-between">
        {asset && <BranchTagSelector branches={branches} tags={tags} />}
        <div className="ml-auto flex flex-row gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowOscalModal(true)}
            data-testid="download-oscal-format"
          >
            <Download className="mr-2 h-4 w-4" />
            Download OSCAL
          </Button>
          <Button
            variant="default"
            onClick={() => openDocumentsModal("catalogs")}
            data-testid="manage-catalogs-and-components"
          >
            <Library className="mr-2 h-4 w-4" />
            Manage frameworks
          </Button>
        </div>
      </div>
      <OscalDownloadModal
        open={showOscalModal}
        setOpen={setShowOscalModal}
        oscalBaseUrl={TUNNEL_BASE_URL + postureBaseUrl(scope) + `oscal/`}
        frameworks={frameworks}
      />
      <ComplianceDocumentsModal
        open={showDocumentsModal}
        setOpen={setShowDocumentsModal}
        tab={documentsTab}
        setTab={setDocumentsTab}
        scope={toComplianceScope(scope)}
        componentsHref={`${pathname}/components`}
        onChange={() => {
          mutatePostures();
          mutateStats();
        }}
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
          {vulns && frameworks.length === 0 ? (
            <EmptyParty
              title="No catalogs activated."
              description="Activate an OSCAL catalog to track its controls as compliance postures."
              Button={
                <Button onClick={() => openDocumentsModal("catalogs")}>
                  Manage catalogs
                </Button>
              }
            />
          ) : (
            <EmptyParty
              title="No matching results."
              description="Try adjusting your search or filter to find what you're looking for."
            />
          )}
          <div className="mt-4">{vulns && <CustomPagination {...vulns} />}</div>
        </div>
      ) : (
        <div>
          <div>
            <div className="overflow-hidden rounded-lg border">
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
                            pathname + "/" + row.original.controlHash,
                          )
                        }
                        className={classNames(
                          "relative cursor-pointer align-center transition-all",
                          i === arr.length - 1 ? "" : "border-b",
                          i % 2 != 0 && "bg-card/50",
                          "hover:bg-muted",
                        )}
                        key={row.original.controlHash}
                        data-testid="compliance-posture-row"
                        data-control-hash={row.original.controlHash}
                        data-framework-control-ids={row.original.frameworkControlIds?.join(
                          " ",
                        )}
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
