"use client";

import SortingCaret from "@/components/common/SortingCaret";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import AuthGuard from "@/components/AuthGuard";

import AcceptRiskDialog from "@/components/AcceptRiskDialog";
import FalsePositiveDialog from "@/components/FalsePositiveDialog";
import Page from "@/components/Page";
import { browserApiClient } from "@/services/devGuardApi";
import type { FirstPartyVuln, Paged } from "@/types/api/api";
import { createColumnHelper, flexRender } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { FunctionComponent } from "react";

import { classNames } from "@/utils/common";

import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import CustomPagination from "@/components/common/CustomPagination";
import EmptyParty from "@/components/common/EmptyParty";
import Section from "@/components/common/Section";
import { AsyncButton, Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAssetBranchesAndTags } from "@/hooks/useActiveAssetVersion";
import useTable from "@/hooks/useTable";
import { toast } from "@/lib/toast";
import { buildFilterSearchParams } from "@/utils/url";
import { Loader2 } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { CopyCodeFragment } from "../../../../../../../../../../components/common/CopyCode";
import RiskScannerDialog from "../../../../../../../../../../components/RiskScannerDialog";
import { Badge } from "../../../../../../../../../../components/ui/badge";
import { Skeleton } from "../../../../../../../../../../components/ui/skeleton";
import { useConfig } from "../../../../../../../../../../context/ConfigContext";
import { fetcher } from "../../../../../../../../../../data-fetcher/fetcher";
import useDebouncedQuerySearch from "../../../../../../../../../../hooks/useDebouncedQuerySearch";
import useDecodedParams from "../../../../../../../../../../hooks/useDecodedParams";
import useRouterQuery from "../../../../../../../../../../hooks/useRouterQuery";
import { defaultScanner } from "../../../../../../../../../../utils/view";
import Filter from "@/components/Filter";
import useScannerImage from "../../../../../../../../../../hooks/useScannerImage";

interface Props {
  vulns: Paged<FirstPartyVuln>;
}

const columnHelper = createColumnHelper<FirstPartyVuln>();

const columnsDef: ColumnDef<FirstPartyVuln, any>[] = [
  columnHelper.accessor("uri", {
    header: "Filename",
    cell: (info) => {
      return (
        info.getValue() && (
          <div className="w-52">
            <CopyCodeFragment codeString={info.getValue()} />
          </div>
        )
      );
    },
  }),

  columnHelper.accessor("message", {
    header: "Message",
    cell: (info) => {
      return (
        <span className="text-base text-muted-foreground">
          {info.getValue()}
        </span>
      );
    },
  }),
  columnHelper.accessor("scannerIds", {
    header: "Scanner",
    cell: (info) => {
      return (
        <Badge className="whitespace-nowrap" variant={"secondary"}>
          {info.getValue().replace(defaultScanner, "")}
        </Badge>
      );
    },
  }),
];

const Index: FunctionComponent = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const [selectedVulnIds, setSelectedVulnIds] = useState<Set<string>>(
    new Set(),
  );

  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [falsePositiveDialogOpen, setFalsePositiveDialogOpen] = useState(false);

  const handleToggleVuln = useCallback((id: string) => {
    setSelectedVulnIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleAll = useCallback((ids: string[]) => {
    setSelectedVulnIds((prev) => {
      const allSelected = ids.length > 0 && ids.every((id) => prev.has(id));
      const next = new Set(prev);
      ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  }, []);

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
    const state = searchParams?.get("state");
    if (!Boolean(state) || state === "open") {
      p.append("filterQuery[state][is]", "open");
    } else {
      p.append("filterQuery[state][is not]", "open");
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
    mutate: mutateVulns,
  } = useSWR<Paged<FirstPartyVuln>>(
    uri +
      "refs/" +
      assetVersionSlug +
      "/" +
      "first-party-vulns/?" +
      query.toString(),
    fetcher,
    {
      keepPreviousData: true,
    },
  );

  const handleBulkAction = useCallback(
    async (bulkParams: {
      vulnIds: string[];
      status: string;
      justification: string;
      mechanicalJustification?: string;
    }) => {
      const optimisticState =
        bulkParams.status === "falsePositive"
          ? "falsePositive"
          : bulkParams.status === "accepted"
            ? "accepted"
            : bulkParams.status === "reopened"
              ? "open"
              : undefined;

      const optimisticData =
        optimisticState && vulns
          ? {
              ...vulns,
              data: vulns.data.map((v) =>
                bulkParams.vulnIds.includes(v.id)
                  ? {
                      ...v,
                      state: optimisticState as FirstPartyVuln["state"],
                    }
                  : v,
              ),
            }
          : undefined;

      await mutateVulns(
        async () => {
          const resp = await browserApiClient(
            uri + "refs/" + assetVersionSlug + "/first-party-vulns/batch/",
            {
              method: "POST",
              body: JSON.stringify({
                vulnIds: bulkParams.vulnIds,
                status: bulkParams.status,
                justification: bulkParams.justification,
                mechanicalJustification:
                  bulkParams.mechanicalJustification ?? "",
              }),
            },
          );

          if (!resp.ok) {
            throw new Error("Bulk action failed");
          }

          setSelectedVulnIds((prev) => {
            const next = new Set(prev);
            bulkParams.vulnIds.forEach((id) => next.delete(id));
            return next;
          });

          return undefined;
        },
        {
          optimisticData,
          rollbackOnError: true,
          revalidate: true,
        },
      );
    },
    [uri, assetVersionSlug, mutateVulns, vulns],
  );

  const { selectedOpenIds, selectedClosedIds } = useMemo(() => {
    if (!vulns?.data) return { selectedOpenIds: [], selectedClosedIds: [] };

    const stateById = new Map<string, string>();
    vulns.data.forEach((v) => stateById.set(v.id, v.state));

    const openIds: string[] = [];
    const closedIds: string[] = [];

    selectedVulnIds.forEach((id) => {
      const state = stateById.get(id);
      if (state === "open") {
        openIds.push(id);
      } else if (state === "accepted" || state === "falsePositive") {
        closedIds.push(id);
      }
    });

    return { selectedOpenIds: openIds, selectedClosedIds: closedIds };
  }, [vulns, selectedVulnIds]);
  const isClosed = searchParams?.get("state") === "closed";
  const filterOptions = useMemo(() => {
    const options = [
      {
        label: "Filename",
        value: "uri",
        operators: [
          { value: "ilike", label: "contains" },
          { value: "is" },
          { value: "is not" },
        ],
      },
      {
        label: "Message",
        value: "message",
        operators: [{ value: "like" }],
      },
      {
        label: "Scanner",
        value: "scanner_ids",
        operators: [
          { value: "ilike", label: "contains" },
          { value: "is" },
          { value: "is not" },
        ],
      },
      ...(isClosed
        ? [
            {
              label: "State",
              value: "state",
              operators: [{ value: "is" }],
              filterValues: [
                { value: "accepted", label: "Accepted" },
                { value: "falsePositive", label: "False Positive" },
                { value: "fixed", label: "Fixed" },
              ],
            },
          ]
        : []),
    ];
    return options;
  }, [isClosed]);

  const { table, handleFilter, removeFilter, clearAllFilters } = useTable({
    columnsDef,
    data: vulns?.data || [],
  });

  const handleSearch = useDebouncedQuerySearch();

  const assetMenu = useAssetMenu();
  const config = useConfig();
  const latestScannerImage = useScannerImage();

  const { branches, tags } = useAssetBranchesAndTags();

  const params = useSearchParams();
  const pathname = usePathname();
  const push = useRouterQuery();

  const pageSelectableIds = table
    .getRowModel()
    .rows.filter((r) => r.original.state !== "fixed")
    .map((r) => r.original.id);
  const allPageSelected =
    pageSelectableIds.length > 0 &&
    pageSelectableIds.every((id) => selectedVulnIds.has(id));
  const somePageSelected = pageSelectableIds.some((id) =>
    selectedVulnIds.has(id),
  );

  return (
    <Page Menu={assetMenu} title={"Risk Handling"} Title={<AssetTitle />}>
      <div className="flex flex-row items-center justify-between">
        <BranchTagSelector branches={branches} tags={tags} />
        <AuthGuard require="admin">
          <Button onClick={() => setIsOpen(true)} variant="default">
            Identify Risks
          </Button>
        </AuthGuard>
      </div>
      <Section
        forceVertical
        primaryHeadline
        title="Identified Code Risks"
        description="This table shows all the identified code risks for this repository."
        className="mb-4 mt-4"
      >
        <div className="relative flex flex-col gap-2">
          <Tabs
            defaultValue={
              params?.has("state") ? (params.get("state") as string) : "open"
            }
          >
            <TabsList>
              <TabsTrigger
                onClick={() =>
                  push({
                    state: "open",
                  })
                }
                value="open"
              >
                Open
              </TabsTrigger>
              <TabsTrigger
                onClick={() =>
                  push({
                    state: "closed",
                  })
                }
                value="closed"
              >
                Closed
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
                    <AuthGuard require="member">
                      {selectedVulnIds.size > 0 && (
                        <tr className="bg-muted/50">
                          <td colSpan={4} className="px-4 py-2">
                            <div className="flex flex-row items-center justify-end">
                              <div className="flex flex-row items-center gap-2">
                                {selectedClosedIds.length > 0 && (
                                  <AsyncButton
                                    variant="secondary"
                                    onClick={async () => {
                                      const count = selectedClosedIds.length;
                                      await handleBulkAction({
                                        vulnIds: selectedClosedIds,
                                        status: "reopened",
                                        justification: "",
                                      });
                                      toast("Reopened", {
                                        description: `${count} code risk${count !== 1 ? "s" : ""} reopened.`,
                                      });
                                    }}
                                  >
                                    Reopen ({selectedClosedIds.length})
                                  </AsyncButton>
                                )}
                                {selectedOpenIds.length > 0 && (
                                  <>
                                    <Button
                                      variant="secondary"
                                      onClick={() =>
                                        setFalsePositiveDialogOpen(true)
                                      }
                                    >
                                      False Positive ({selectedOpenIds.length})
                                    </Button>
                                    <Button
                                      variant="secondary"
                                      onClick={() => setAcceptDialogOpen(true)}
                                    >
                                      Accept Risk ({selectedOpenIds.length})
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  onClick={() => setSelectedVulnIds(new Set())}
                                >
                                  Clear
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </AuthGuard>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        <AuthGuard require="member">
                          <th className="w-10 p-4 text-left">
                            <div onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={
                                  allPageSelected
                                    ? true
                                    : somePageSelected
                                      ? "indeterminate"
                                      : false
                                }
                                onCheckedChange={() =>
                                  handleToggleAll(pageSelectableIds)
                                }
                                disabled={pageSelectableIds.length === 0}
                              />
                            </div>
                          </th>
                        </AuthGuard>
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
                    {!table.getRowModel().rows &&
                      isLoading &&
                      Array.from(Array(10).keys()).map((el, i, arr) => (
                        <tr
                          className={classNames(
                            "relative cursor-pointer align-top transition-all",
                            i === arr.length - 1 ? "" : "border-b",
                            i % 2 !== 0 && "bg-card/50",
                          )}
                          key={el}
                        >
                          <AuthGuard require="member">
                            <td className="p-4" />
                          </AuthGuard>
                          <td className="p-4">
                            <Skeleton className="w-1/2 h-[20px]" />
                          </td>
                          <td className="p-4">
                            <Skeleton className="w-full h-[20px]" />
                          </td>
                          <td className="p-4">
                            <Skeleton className="w-1/2 h-[20px]" />
                          </td>
                        </tr>
                      ))}
                    {table.getRowModel().rows.map((row, i, arr) => (
                      <tr
                        onClick={(e) => {
                          if (
                            (e.target as HTMLElement).closest(
                              'button, input, [role="checkbox"]',
                            )
                          )
                            return;
                          router?.push(pathname + "/" + row.original.id);
                        }}
                        className={classNames(
                          "relative cursor-pointer align-top transition-all",
                          i === arr.length - 1 ? "" : "border-b",
                          i % 2 != 0 && "bg-card/50",
                          "hover:bg-muted",
                        )}
                        key={row.original.id}
                      >
                        <AuthGuard require="member">
                          <td className="p-4">
                            {row.original.state !== "fixed" && (
                              <div onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={selectedVulnIds.has(row.original.id)}
                                  onCheckedChange={() =>
                                    handleToggleVuln(row.original.id)
                                  }
                                />
                              </div>
                            )}
                          </td>
                        </AuthGuard>
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
      <RiskScannerDialog
        apiUrl={config.devguardApiUrlPublicInternet}
        frontendUrl={config.frontendUrl}
        devguardCIComponentBase={config.devguardCIComponentBase}
        devguardWebLatestScannerImage={latestScannerImage}
        open={isOpen}
        onOpenChange={setIsOpen}
      />

      <AcceptRiskDialog
        open={acceptDialogOpen}
        onOpenChange={setAcceptDialogOpen}
        onSubmit={async (justification) => {
          if (selectedOpenIds.length === 0) return false;
          const count = selectedOpenIds.length;
          await handleBulkAction({
            vulnIds: selectedOpenIds,
            status: "accepted",
            justification,
          });
          toast("Risk Accepted", {
            description: `${count} code risk${count !== 1 ? "s" : ""} accepted.`,
          });
          return true;
        }}
        description={
          <>
            You are about to accept the risk for {selectedOpenIds.length}{" "}
            selected code risk{selectedOpenIds.length !== 1 ? "s" : ""}. This
            acknowledges you are aware of the vulnerability and its potential
            impact.
          </>
        }
      />

      <FalsePositiveDialog
        open={falsePositiveDialogOpen}
        onOpenChange={setFalsePositiveDialogOpen}
        onSubmit={async (data) => {
          if (selectedOpenIds.length === 0) return false;
          const count = selectedOpenIds.length;
          await handleBulkAction({
            vulnIds: selectedOpenIds,
            status: "falsePositive",
            justification: data.justification,
            mechanicalJustification: data.mechanicalJustification,
          });
          toast("Marked as False Positive", {
            description: `${count} code risk${count !== 1 ? "s" : ""} marked as false positive.`,
          });
          return true;
        }}
        description={
          <>
            You are about to mark {selectedOpenIds.length} selected code risk
            {selectedOpenIds.length !== 1 ? "s" : ""} as false positive.
          </>
        }
      />
    </Page>
  );
};

export default Index;
