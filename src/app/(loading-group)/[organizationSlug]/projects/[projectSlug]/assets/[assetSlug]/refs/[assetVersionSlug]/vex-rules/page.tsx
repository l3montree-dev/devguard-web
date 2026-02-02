"use client";

import Page from "@/components/Page";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { Paged, VexRule } from "@/types/api/api";
import { FunctionComponent, useMemo, useState } from "react";
import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import CustomPagination from "@/components/common/CustomPagination";
import EmptyParty from "@/components/common/EmptyParty";
import Err from "@/components/common/Err";
import Section from "@/components/common/Section";
import SortingCaret from "@/components/common/SortingCaret";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/context/SessionContext";
import {
  useActiveAssetVersion,
  useAssetBranchesAndTags,
} from "@/hooks/useActiveAssetVersion";
import useDebouncedQuerySearch from "@/hooks/useDebouncedQuerySearch";
import useDecodedParams from "@/hooks/useDecodedParams";
import useTable from "@/hooks/useTable";
import { classNames } from "@/utils/common";
import { buildFilterSearchParams } from "@/utils/url";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import VexHasEffectBadge from "@/components/vex-rules/VexHasEffectBadge";
import VexPathPattern from "@/components/vex-rules/VexPathPattern";
import VexRuleResult from "@/components/vex-rules/VexRuleResult";
import VexRulesRow from "@/components/vex-rules/VexRulesRow";
import SyncedUpstreamVexSources from "@/components/vex-rules/SyncedUpstreamVexSources";
import VexUploadModal from "@/components/vex-rules/VexUploadModal";
import SbomDownloadModal from "@/components/dependencies/SbomDownloadModal";
import VexDownloadModal from "@/components/dependencies/VexDownloadModal";
import DependencyRiskScannerDialog from "@/components/RiskScannerDialog";
import { useArtifacts } from "@/context/AssetVersionContext";
import { useConfig } from "@/context/ConfigContext";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { browserApiClient } from "@/services/devGuardApi";

// TODO: Remove mock imports when backend is ready
import {
  mockVexRulesData,
  mockVexRulesEmpty,
} from "./__mocks__/vexRulesMockData";
import Callout from "@/components/common/Callout";

// Toggle this to test empty state
const USE_EMPTY_MOCK = false;

const columnHelper = createColumnHelper<VexRule>();

const columnsDef: ColumnDef<VexRule, any>[] = [
  columnHelper.accessor("cveId", {
    header: "CVE ID",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor("pathPattern", {
    header: "Path Pattern",
    cell: (info) => <VexPathPattern pathPattern={info.getValue()} />,
  }),
  columnHelper.accessor("eventType", {
    header: "Rule Result",
    cell: (info) => <VexRuleResult eventType={info.getValue()} />,
  }),
  columnHelper.accessor("effectCount", {
    header: "Has Effect",
    cell: (info) => <VexHasEffectBadge effectCount={info.getValue()} />,
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: (info) => {
      const handleDelete = () => {
        toast.success(`Deleted VEX rule for ${info.row.original.cveId}`);
        // TODO: Implement actual deletion
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  }),
];

const VexRulesPage: FunctionComponent = () => {
  const [showVexModal, setShowVexModal] = useState(false);
  const [uploadVexModal, setUploadVexModal] = useState(false);
  const params = useDecodedParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const asset = useActiveAsset();
  const assetVersion = useActiveAssetVersion();
  const artifacts = useArtifacts();
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    params as {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
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
    "/refs/" +
    assetVersionSlug +
    "/vex-rules/?" +
    query.toString();

  // TODO: Replace mock data with real API call when backend is ready
  // Fetch VEX rules data using SWR
  // const {
  //   data: vexRules,
  //   error,
  //   isLoading,
  // } = useSWR<Paged<VexRule>>(url, fetcher);

  // Mock data - remove when backend is ready
  const vexRules = USE_EMPTY_MOCK ? mockVexRulesEmpty : mockVexRulesData;
  const error = null;
  const isLoading = false;

  const { table } = useTable({
    columnsDef,
    data: vexRules?.data || [],
  });

  const handleSearch = useDebouncedQuerySearch();

  const assetMenu = useAssetMenu();
  const { branches, tags } = useAssetBranchesAndTags();

  const handleVexUpload = async (params: {
    file: File;
    branchOrTagName: string;
    branchOrTagSlug: string;
    isTag: boolean;
  }) => {
    const formData = new FormData();
    formData.append("vex", params.file);

    const uploadUrl = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${params.branchOrTagSlug}/vex/`;

    try {
      const response = await browserApiClient(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      toast.success("VEX file uploaded successfully");
      // TODO: Trigger data refresh when real API is connected
    } catch (error) {
      toast.error("Failed to upload VEX file");
      throw error;
    }
  };

  // Show loading skeleton if data is loading
  if (isLoading && !vexRules) {
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
      <div className="flex flex-row items-center justify-between">
        <BranchTagSelector branches={branches} tags={tags} />
        <div className="flex flex-row gap-2">
          <Button variant={"secondary"} onClick={() => setUploadVexModal(true)}>
            Upload a VEX
          </Button>
          <Button variant={"secondary"} onClick={() => setShowVexModal(true)}>
            Share your VEX
          </Button>
        </div>
      </div>
      <Section
        description="Manage VEX (Vulnerability Exploitability eXchange) rules for this repository ref (branches/ tags). VEX rules define how vulnerabilities should be handled based on their context."
        primaryHeadline
        forceVertical
        title="Manage VEX Rules"
        className="mb-4 mt-4"
      >
        <SyncedUpstreamVexSources />
        <div>
          <Callout intent={"info"} showIcon>
            <span className="text-sm flex items-center">
              Note: VEX rule are created by handling a dependency risk using the
              given graph based assessment option on a dependency risks details
              page.
            </span>
          </Callout>
        </div>
        <div className="relative flex flex-row gap-2">
          <Input
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams?.get("search") ?? ""}
            placeholder="Search for CVE ID, justification or source..."
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
      </Section>

      {!vexRules?.data.length ? (
        <div>
          <EmptyParty
            title="No VEX rules found."
            description="VEX (Vulnerability Exploitability eXchange) rules define how vulnerabilities should be handled based on their context. Rules can be created automatically from upstream sources or manually configured."
          />
          <div className="mt-4">
            {vexRules && <CustomPagination {...vexRules} />}
          </div>
        </div>
      ) : (
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
                    table
                      .getRowModel()
                      .rows.map((row, i, arr) => (
                        <VexRulesRow
                          key={row.id}
                          row={row}
                          index={i}
                          isLast={i === arr.length - 1}
                        />
                      ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4">
            <CustomPagination {...vexRules} />
          </div>
        </div>
      )}
      <VexUploadModal
        open={uploadVexModal}
        onOpenChange={setUploadVexModal}
        onUpload={handleVexUpload}
      />
      <VexDownloadModal
        artifacts={artifacts}
        showVexModal={showVexModal}
        setShowVexModal={setShowVexModal}
        pathname={pathname || ""}
        assetName={asset?.name}
        assetVersionName={assetVersion?.name}
      />
    </Page>
  );
};

export default VexRulesPage;
