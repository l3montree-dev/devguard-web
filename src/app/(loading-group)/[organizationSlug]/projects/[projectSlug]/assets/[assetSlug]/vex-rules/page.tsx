"use client";

import AuthGuard from "@/components/AuthGuard";
import AssetTitle from "@/components/common/AssetTitle";
import { DocDrawer } from "@/components/common/DocDrawer";
import EmptyParty from "@/components/common/EmptyParty";
import Err from "@/components/common/Err";
import Section from "@/components/common/Section";
import SortingCaret from "@/components/common/SortingCaret";
import VexDownloadModal from "@/components/dependencies/VexDownloadModal";
import Page from "@/components/Page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import SyncedUpstreamVexSources from "@/components/vex-rules/SyncedUpstreamVexSources";
import VexHasEffectBadge from "@/components/vex-rules/VexHasEffectBadge";
import VexRuleActionsCell from "@/components/vex-rules/VexRuleActionsCell";
import VexRuleResult from "@/components/vex-rules/VexRuleResult";
import VexRulesRow from "@/components/vex-rules/VexRulesRow";
import VexUploadModal from "@/components/vex-rules/VexUploadModal";
import AddVexRuleDialog from "@/components/vex-rules/AddVexRuleDialog";
import { fetcher } from "@/data-fetcher/fetcher";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useDebouncedQuerySearch from "@/hooks/useDebouncedQuerySearch";
import useDecodedParams from "@/hooks/useDecodedParams";
import useTable from "@/hooks/useTable";
import { toast } from "@/lib/toast";
import { browserApiClient } from "@/services/devGuardApi";
import type { Paged, VexRule } from "@/types/api/api";
import { classNames } from "@/utils/common";
import { buildFilterSearchParams } from "@/utils/url";
import type { ColumnDef } from "@tanstack/react-table";
import { createColumnHelper, flexRender } from "@tanstack/react-table";
import { groupBy } from "lodash";
import { Loader2 } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { type FunctionComponent, useMemo, useState } from "react";
import useSWR from "swr";

const columnHelper = createColumnHelper<VexRule>();

const baseColumnsDef: ColumnDef<VexRule, any>[] = [
  columnHelper.accessor("title", {
    header: "Title",
    cell: (info) => {
      const title = info.getValue();
      return (
        <span className="text-sm text-foreground truncate max-w-[300px]">
          {title}
        </span>
      );
    },
  }),
  columnHelper.accessor("eventType", {
    header: "Rule Result",
    cell: (info) => (
      <VexRuleResult
        eventType={info.getValue()}
        mechanicalJustification={info.row.original.mechanicalJustification}
      />
    ),
  }),
  columnHelper.accessor("appliesToAmountOfDependencyVulns", {
    header: "Has Effect",
    cell: (info) => <VexHasEffectBadge effectCount={info.getValue()} />,
  }),
];

const VexRulesPage: FunctionComponent = () => {
  const [showVexModal, setShowVexModal] = useState(false);
  const [uploadVexModal, setUploadVexModal] = useState(false);
  const [addVexRuleModal, setAddVexRuleModal] = useState(false);
  const params = useDecodedParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const asset = useActiveAsset();
  const { organizationSlug, projectSlug, assetSlug } = params as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
  };

  const query = useMemo(() => {
    return buildFilterSearchParams(searchParams);
  }, [searchParams]);

  // Build the API URL
  const url =
    "/organizations/" +
    organizationSlug +
    "/projects/" +
    projectSlug +
    "/assets/" +
    assetSlug +
    "/vex-rules/?" +
    query.toString();

  // Fetch VEX rules data using SWR
  const {
    data: vexRulesResponse,
    error,
    isLoading,
    mutate,
  } = useSWR<Paged<VexRule>>(url, fetcher);
  const vexRules = vexRulesResponse?.data;
  // Create actions column with access to params and mutate
  const actionsColumn: ColumnDef<VexRule, any> = useMemo(
    () =>
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => {
          const rule = info.row.original;
          const deleteUrl = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/vex-rules/${rule.id}`;

          return (
            <VexRuleActionsCell
              rule={rule}
              deleteUrl={deleteUrl}
              onDeleted={() => mutate()}
            />
          );
        },
      }),
    [mutate, organizationSlug, projectSlug, assetSlug],
  );

  const columnsDef = useMemo(
    () => [...baseColumnsDef, actionsColumn],
    [actionsColumn],
  );

  const { table } = useTable(
    {
      columnsDef,
      data: vexRules ?? [],
    },
    {
      meta: {
        organizationSlug,
        projectSlug,
        assetSlug,
      },
    },
  );

  // Group vex rules by vexSource and create list of unique sources in a single memo
  const { groupedVexRules, vexSourceGroups } = useMemo(() => {
    if (!vexRules) return { groupedVexRules: {}, vexSourceGroups: [] };
    const grouped = groupBy(vexRules, "vexSource");
    return {
      groupedVexRules: grouped,
      vexSourceGroups: Object.keys(grouped),
    };
  }, [vexRules]);

  const handleSearch = useDebouncedQuerySearch();
  const assetMenu = useAssetMenu();
  const handleVexUpload = async (params: { file: File }) => {
    // Read file content as text (VEX is JSON)
    const fileContent = await params.file.text();

    const response = await browserApiClient(`/vex`, {
      method: "POST",
      body: fileContent,
      headers: {
        "X-Origin": "vex-upload",
      },
    });

    if (!response.ok) {
      // read the body for error details
      const errorText = await response.text();
      toast.error("Failed to upload VEX file: " + errorText);
      throw new Error("Failed to upload VEX file: " + errorText);
    }

    toast.success("VEX file uploaded successfully");
    mutate();
  };

  // Show loading skeleton if data is loading
  if (isLoading && !vexRulesResponse) {
    return (
      <Page title="Loading VEX Rules...">
        <div className="space-y-4">
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-8" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-16" />
            ))}
          </div>
        </div>
      </Page>
    );
  }

  // Show error state
  if (error) {
    return (
      <Page Menu={assetMenu} title={"VEX Rules"} Title={<AssetTitle />}>
        <Err />
      </Page>
    );
  }

  return (
    <Page Menu={assetMenu} title={"Manage VEX Rules"} Title={<AssetTitle />}>
      <div className="flex justify-end">
        <AuthGuard require="member">
          <div className="flex flex-row gap-2">
            <Button
              variant="secondary"
              data-testid="upload-vex-button"
              onClick={() => setUploadVexModal(true)}
            >
              Add a VEX-File or VEX-URL
            </Button>
            <Button
              data-testid="create-vex-rules-button"
              onClick={() => setAddVexRuleModal(true)}
            >
              Add VEX rule
            </Button>
          </div>
        </AuthGuard>
      </div>
      <Section
        description="Manage VEX (Vulnerability Exploitability eXchange) rules for this asset. VEX rules define how vulnerabilities should be handled based on their context."
        primaryHeadline
        forceVertical
        title="Manage VEX Rules"
        className="mb-4 mt-4"
      >
        <div className="-mt-4">
          <DocDrawer
            triggerLabel="Learn about CSAF/VEX"
            drawerTitle="CSAF/VEX Explained"
            mdxUrl="https://raw.githubusercontent.com/l3montree-dev/devguard-documentation/main/src/pages/explanations/compliance/csaf-vex-explained.mdx"
            docsUrl="https://docs.devguard.org/explanations/compliance/csaf-vex-explained/"
          />
        </div>
        <SyncedUpstreamVexSources />
        <div className="relative flex flex-row gap-2">
          <Input
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams?.get("search") as string}
            placeholder="Search for CVE ID, justification or source..."
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
      </Section>

      {!vexRules?.length ? (
        <div>
          <EmptyParty
            title="No VEX rules found."
            description="VEX (Vulnerability Exploitability eXchange) rules define how vulnerabilities should be handled based on their context. Rules can be created automatically from upstream sources or manually configured."
          />
        </div>
      ) : (
        <div>
          <div className="overflow-hidden rounded-lg border shadow-sm">
            <div className="overflow-auto">
              <table className="w-full overflow-x-auto text-sm ">
                <colgroup>
                  <col className="w-[100px]" />
                  <col className="w-[170px]" />
                  <col className="w-[100px]" />
                  <col className="w-[100px]" />
                </colgroup>
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
                          "relative align-top transition-all",
                          i === arr.length - 1 ? "" : "border-b",
                          i % 2 !== 0 && "bg-card/50",
                        )}
                        key={el}
                      >
                        {columnsDef.map((_, j) => (
                          <td key={j} className="p-4">
                            <Skeleton className="h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  {!isLoading &&
                    vexSourceGroups.map((vexSource, groupIndex) => {
                      const rulesInGroup = groupedVexRules[vexSource];
                      // Find the first row for this group to use for rendering
                      const firstRuleInGroup = rulesInGroup[0];
                      const rowForGroup = table
                        .getRowModel()
                        .rows.find(
                          (r) => r.original.id === firstRuleInGroup.id,
                        );

                      if (!rowForGroup) return null;

                      return (
                        <VexRulesRow
                          key={vexSource}
                          row={rowForGroup}
                          index={groupIndex}
                          vexRulesInGroup={rulesInGroup}
                          deleteUrlBase={`/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/vex-rules`}
                          onDeleted={() => mutate()}
                        />
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <VexUploadModal
        open={uploadVexModal}
        onOpenChange={setUploadVexModal}
        onUpload={handleVexUpload}
      />
      <AddVexRuleDialog
        open={addVexRuleModal}
        onOpenChange={setAddVexRuleModal}
        baseUrl={`/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/vex-rules`}
        onCreated={() => mutate()}
      />
      <VexDownloadModal
        showVexModal={showVexModal}
        setShowVexModal={setShowVexModal}
        pathname={pathname || ""}
        assetName={asset?.name}
      />
    </Page>
  );
};

export default VexRulesPage;
