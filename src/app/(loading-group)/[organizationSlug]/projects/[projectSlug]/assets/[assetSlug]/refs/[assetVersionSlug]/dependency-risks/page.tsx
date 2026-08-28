"use client";

import AcceptRiskDialog from "@/components/AcceptRiskDialog";
import AuthGuard from "@/components/AuthGuard";
import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import CustomPagination from "@/components/common/CustomPagination";
import EmptyParty from "@/components/common/EmptyParty";
import Section from "@/components/common/Section";
import SortingCaret from "@/components/common/SortingCaret";
import FalsePositiveDialog from "@/components/FalsePositiveDialog";
import Filter from "@/components/Filter";
import Page from "@/components/Page";
import RiskHandlingRow from "@/components/risk-handling/RiskHandlingRow";
import { AsyncButton, Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { documentationLinks } from "@/const/documentationLinks";
import {
  useActiveAssetVersion,
  useAssetBranchesAndTags,
} from "@/hooks/useActiveAssetVersion";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useTable from "@/hooks/useTable";
import { toast } from "@/lib/toast";
import { browserApiClient } from "@/services/devGuardApi";
import type { Paged, VulnByPackage, VulnWithCVE } from "@/types/api/api";
import { buildFilterSearchParams } from "@/utils/url";
import type { ColumnDef } from "@tanstack/react-table";
import { createColumnHelper, flexRender } from "@tanstack/react-table";
import { CircleHelp, Loader2, CircleFadingArrowUp } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FunctionComponent } from "react";
import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import SbomDownloadModal from "../../../../../../../../../../components/dependencies/SbomDownloadModal";
import VexDownloadModal from "../../../../../../../../../../components/dependencies/VexDownloadModal";
import DependencyRiskScannerDialog from "../../../../../../../../../../components/RiskScannerDialog";
import { Skeleton } from "../../../../../../../../../../components/ui/skeleton";
import AddVexRuleDialog from "../../../../../../../../../../components/vex-rules/AddVexRuleDialog";
import VexRuleRecommendationsTable from "../../../../../../../../../../components/vex-rules/VexRuleRecommendationsTable";
import { useArtifacts } from "../../../../../../../../../../context/AssetVersionContext";
import { useConfig } from "../../../../../../../../../../context/ConfigContext";
import { fetcher } from "../../../../../../../../../../data-fetcher/fetcher";
import { useActiveAsset } from "../../../../../../../../../../hooks/useActiveAsset";
import useDebouncedQuerySearch from "../../../../../../../../../../hooks/useDebouncedQuerySearch";
import useDecodedParams from "../../../../../../../../../../hooks/useDecodedParams";
import useDecodedPathname from "../../../../../../../../../../hooks/useDecodedPathname";
import useRouterQuery from "../../../../../../../../../../hooks/useRouterQuery";
import useScannerImage from "../../../../../../../../../../hooks/useScannerImage";
import useVexRuleRecommendations from "../../../../../../../../../../hooks/useVexRuleRecommendations";

const severityRanges: Record<string, [number | null, number | null]> = {
  low: [null, 4],
  medium: [3.9, 7],
  high: [6.9, 9],
  critical: [8.9, null],
};

const rangeFilterFields = ["CVE.cvss", "risk_assessment"];

const columnHelper = createColumnHelper<VulnByPackage>();

const columnsDef: ColumnDef<VulnByPackage, any>[] = [
  {
    ...columnHelper.accessor("packageName", {
      header: "Package",
      id: "components.id",
      enableSorting: true,
    }),
  },
  {
    ...columnHelper.accessor("maxRisk", {
      header: "Risk",
      enableSorting: true,
      id: "max_risk",
    }),
  },
  {
    ...columnHelper.accessor("maxCvss", {
      header: "CVSS",
      enableSorting: true,
      id: "max_cvss",
    }),
  },
  {
    ...columnHelper.accessor("vulnCount", {
      header: "Vulnerabilities",
      id: "dependency_vuln_count",
      enableSorting: true,
    }),
  },
];

const Index: FunctionComponent = () => {
  const [showSBOMModal, setShowSBOMModal] = useState(false);
  const [showVexModal, setShowVexModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVulnIds, setSelectedVulnIds] = useState<Set<string>>(
    new Set(),
  );

  // Batch action dialog state
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
      const allSelected = ids.every((id) => prev.has(id));
      const next = new Set(prev);
      ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  }, []);
  const config = useConfig();
  const latestScannerImage = useScannerImage();

  const assetMenu = useAssetMenu();
  const asset = useActiveAsset();
  const assetVersion = useActiveAssetVersion();

  const router = useRouter();
  const { branches, tags } = useAssetBranchesAndTags();
  const pathname = useDecodedPathname();
  const params = useSearchParams();

  const artifacts = useArtifacts();
  const push = useRouterQuery();

  let { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    useDecodedParams() as {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
    };

  const searchParams = useSearchParams();

  const queryWithState = useMemo(() => {
    const p = buildFilterSearchParams(searchParams);
    const state = searchParams?.get("state");
    if (!Boolean(state) || state === "open") {
      p.append("filterQuery[state][is]", "open");
    } else {
      p.append("filterQuery[state][is not]", "open");
    }

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

  const vulnsSwrKey =
    uri +
    "refs/" +
    assetVersionSlug +
    "/" +
    "dependency-vulns/?" +
    queryWithState.toString();

  const {
    data: vulns,
    isLoading,
    error,
    mutate: mutateVulns,
  } = useSWR<Paged<VulnByPackage>>(vulnsSwrKey, fetcher, {
    keepPreviousData: true,
  });

  const fixableFilterParams = useMemo(() => {
    const p = new URLSearchParams(queryWithState);
    p.append("filterQuery[direct_dependency_fixed_version][is not null]", "1");
    return p;
  }, [queryWithState]);

  const fixableVulnsSwrKey = useMemo(() => {
    const p = new URLSearchParams(fixableFilterParams);
    p.set("page", "1");
    p.set("pageSize", "0");
    return (
      uri + "refs/" + assetVersionSlug + "/dependency-vulns/?" + p.toString()
    );
  }, [fixableFilterParams, uri, assetVersionSlug]);

  const { data: fixableVulns } = useSWR<Paged<VulnByPackage>>(
    fixableVulnsSwrKey,
    fetcher,
  );
  const fixableVulnsCount = fixableVulns?.total ?? 0;

  const handleBulkAction = useCallback(
    async (params: {
      vulnIds: string[];
      status: string;
      justification: string;
      mechanicalJustification?: string;
    }) => {
      const optimisticState =
        params.status === "falsePositive"
          ? "falsePositive"
          : params.status === "accepted"
            ? "accepted"
            : params.status === "reopened"
              ? "open"
              : undefined;

      const optimisticData =
        optimisticState && vulns
          ? {
              ...vulns,
              data: vulns.data.map((pkg) => ({
                ...pkg,
                vulns: pkg.vulns.map((v) =>
                  params.vulnIds.includes(v.id)
                    ? { ...v, state: optimisticState as VulnWithCVE["state"] }
                    : v,
                ),
              })),
            }
          : undefined;

      await mutateVulns(
        async () => {
          const resp = await browserApiClient(
            uri + "refs/" + assetVersionSlug + "/dependency-vulns/batch/",
            {
              method: "POST",
              body: JSON.stringify({
                vulnIds: params.vulnIds,
                status: params.status,
                justification: params.justification,
                mechanicalJustification: params.mechanicalJustification ?? "",
              }),
            },
          );

          if (!resp.ok) {
            throw new Error("Bulk action failed");
          }

          // clear selection for the affected IDs
          setSelectedVulnIds((prev) => {
            const next = new Set(prev);
            params.vulnIds.forEach((id) => next.delete(id));
            return next;
          });

          // SWR will revalidate (revalidate: true), so returning undefined is fine
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

  const handleSearch = useDebouncedQuerySearch();

  const isClosed = params?.get("state") === "closed";

  const filterOptions: {
    label: string;
    value: string;
    operators: Array<{ value: string; label?: string }>;
    filterValues?: Array<{ value: string; label?: string }>;
  }[] = [
    {
      label: "Artifact",
      value: "artifact_dependency_vulns.artifact_artifact_name",
      operators: [
        { value: "is" },
        { value: "is not" },
        { value: "ilike", label: "contains" },
      ],
      filterValues: artifacts.map((a) => ({ value: a.artifactName })),
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
    {
      label: "Package Name",
      value: "component_purl",
      operators: [
        { value: "ilike", label: "contains" },
        { value: "is" },
        { value: "is not" },
      ],
    },
    {
      label: "Direct Dependency Fix",
      value: "direct_dependency_fixed_version",
      operators: [
        { value: "is not null", label: "available" },
        { value: "is null", label: "not available" },
      ],
    },
    {
      label: "Component Fix",
      value: "component_fixed_version",
      operators: [
        { value: "is not null", label: "available" },
        { value: "is null", label: "not available" },
      ],
    },
    {
      label: "CVE",
      value: "cve_id",
      operators: [
        { value: "ilike", label: "contains" },
        { value: "is" },
        { value: "is not" },
      ],
    },
    {
      label: "CVSS",
      value: "CVE.cvss",
      operators: [
        { value: "is less than" },
        { value: "is greater than" },
        { value: "is" },
      ],
      filterValues: [
        { value: "low", label: "Low (0-4)" },
        { value: "medium", label: "Medium (4-7)" },
        { value: "high", label: "High (7-9)" },
        { value: "critical", label: "Critical (9-10)" },
      ],
    },
    {
      label: "Risk",
      value: "risk_assessment",
      operators: [
        { value: "is less than" },
        { value: "is greater than" },
        { value: "is" },
      ],
      filterValues: [
        { value: "low", label: "Low (0-4)" },
        { value: "medium", label: "Medium (4-7)" },
        { value: "high", label: "High (7-9)" },
        { value: "critical", label: "Critical (9-10)" },
      ],
    },
  ];

  const { table, handleFilter, removeFilter, clearAllFilters } = useTable({
    columnsDef,
    data: vulns?.data || [],
  });

  const handleDependencyFilter = useCallback(
    (data: Parameters<typeof handleFilter>[0]) => {
      if (
        rangeFilterFields.includes(data.field) &&
        (data.operator === "is" || data.operator === "is not") &&
        severityRanges[data.value]
      ) {
        const [min, max] = severityRanges[data.value];
        const newParams = new URLSearchParams(params?.toString() ?? "");
        if (min !== null) {
          newParams.set(
            `filterQuery[${data.field}][is greater than]`,
            String(min),
          );
        }
        if (max !== null) {
          newParams.set(
            `filterQuery[${data.field}][is less than]`,
            String(max),
          );
        }
        router.push(pathname + "?" + newParams.toString());
        return;
      }
      handleFilter(data);
    },
    [handleFilter, params, pathname, router],
  );

  const vexRulesUrl = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/vex-rules`;

  const {
    canSeeRecommendations,
    addRuleDialogOpen,
    rulePrefill,
    recommendationsResponse,
    setAddRuleDialogOpen,
    createRuleFromRecommendation,
  } = useVexRuleRecommendations(
    new URLSearchParams({ page: "1", pageSize: "3" }),
  );

  // Compute selected open/closed IDs for batch actions
  const { selectedOpenIds, selectedClosedIds } = useMemo(() => {
    if (!vulns?.data) return { selectedOpenIds: [], selectedClosedIds: [] };

    const vulnById = new Map<string, { state: string }>();
    vulns.data.forEach((pkg) => {
      pkg.vulns.forEach((v) => {
        vulnById.set(v.id, { state: v.state });
      });
    });

    const openIds: string[] = [];
    const closedIds: string[] = [];

    selectedVulnIds.forEach((id) => {
      const vuln = vulnById.get(id);
      if (vuln?.state === "open") {
        openIds.push(id);
      } else if (
        vuln?.state === "accepted" ||
        vuln?.state === "falsePositive"
      ) {
        closedIds.push(id);
      }
    });

    return { selectedOpenIds: openIds, selectedClosedIds: closedIds };
  }, [vulns?.data, selectedVulnIds]);

  return (
    <Page Menu={assetMenu} title={"Risk Handling"} Title={<AssetTitle />}>
      <div className="flex flex-row items-center justify-between">
        <BranchTagSelector branches={branches} tags={tags} />
        <div className="flex flex-row gap-2">
          <Button
            data-testid="share-sbom-button"
            variant={"secondary"}
            onClick={() => setShowSBOMModal(true)}
          >
            Share your SBOM
          </Button>
          <Button
            data-testid="share-vex-button"
            variant={"secondary"}
            onClick={() => setShowVexModal(true)}
          >
            Share your VEX
          </Button>
          <AuthGuard require="member">
            <Button onClick={() => setIsOpen(true)} variant="default">
              Identify Risks
            </Button>
          </AuthGuard>
        </div>
      </div>
      <VexDownloadModal
        showVexModal={showVexModal}
        setShowVexModal={setShowVexModal}
        pathname={pathname}
        assetName={asset?.name}
      />
      <Section
        forceVertical
        primaryHeadline
        title="Identified Dependency Risks"
        description="This table shows all the identified dependency risks for this repository."
        className="mb-4 mt-4"
      >
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-row gap-2">
            {recommendationsResponse?.data && canSeeRecommendations && (
              <div className="flex-3 relative">
                <small className="text-xs absolute top-5 right-5">
                  <Link
                    href={"../../vex-rules"}
                    className="text-xs !text-muted-foreground font-medium"
                  >
                    See all recommendations
                  </Link>
                </small>
                <VexRuleRecommendationsTable
                  hidePagination={true}
                  onCreateRule={createRuleFromRecommendation}
                  recommendations={recommendationsResponse}
                />
                <div className="flex flex-row items-center justify-between">
                  <small className="text-xs text-muted-foreground -mt-2 text-right block">
                    VEX-Rule recommendations are not scoped to a specific branch
                    or tag out of performance reasons.
                  </small>
                </div>
                <AddVexRuleDialog
                  open={addRuleDialogOpen}
                  onOpenChange={setAddRuleDialogOpen}
                  baseUrl={vexRulesUrl}
                  onCreated={() => mutateVulns()}
                  prefill={rulePrefill}
                />
              </div>
            )}

            <Card className="flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="flex flex-row items-start justify-between">
                  <span className="flex flex-row items-center gap-2">
                    <CircleFadingArrowUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-3xl">{fixableVulnsCount}</span>
                  </span>
                  <Link
                    href={`${pathname}?${fixableFilterParams.toString()}`}
                    className="text-xs !text-muted-foreground"
                  >
                    See all
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Vulnerabilities fixable by a direct dependency update. Learn
                  how the transitive vulnerability path analysis and{" "}
                  <Link
                    href={documentationLinks.quickFix}
                    target="_blank"
                    className="underline"
                  >
                    Quick Fix algorithm
                  </Link>{" "}
                  works.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <Tabs
            value={
              params?.has("state") ? (params.get("state") as string) : "open"
            }
          >
            <TabsList>
              <TabsTrigger
                data-testid="dependency-risk-open-button"
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
                data-testid="dependency-risk-closed-button"
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
          <div className="flex flex-row gap-2">
            <Filter
              options={filterOptions}
              onFilter={handleDependencyFilter}
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
      </Section>
      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : !vulns?.data?.length ? (
        <div>
          <EmptyParty
            title="No matching results."
            description="Risk identification is the process of determining what risks exist in the asset and what their characteristics are. This process is done by identifying, assessing, and prioritizing risks."
          />
          <div className="mt-4">{vulns && <CustomPagination {...vulns} />}</div>
        </div>
      ) : (
        <div>
          <div className="rounded-lg overflow-hidden border shadow-sm">
            <div>
              <table className="w-full text-left text-sm table-fixed">
                <colgroup>
                  <col className="w-auto" />
                  <col className="w-[160px]" />
                  <col className="w-[130px]" />
                  <col className="w-[220px]" />
                </colgroup>
                <thead className="border-b bg-card text-foreground sticky top-0 z-10">
                  {/* Batch action row - shown when items are selected and user is logged in */}
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
                                      description: `${count} vulnerability path${count !== 1 ? "s" : ""} reopened.`,
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
                      {headerGroup.headers.map((header) => (
                        <th
                          className="cursor-pointer break-normal p-4 text-left bg-card"
                          onClick={
                            header.column.columnDef.enableSorting
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                          key={header.id}
                        >
                          <div className="flex flex-row items-center gap-2">
                            {header.isPlaceholder ? null : (
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
                                  <CircleHelp className="w-4 h-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="relative font-normal">
                                    Risk Value is a context-aware score that
                                    adjusts the CVSS by factoring in real-world
                                    exploitability and system relevance. It
                                    reflects the{" "}
                                    <span className="font-bold">
                                      actual risk a vulnerability poses
                                    </span>
                                    , not just its theoretical severity.{" "}
                                    <Link
                                      href={documentationLinks.riskCalculation}
                                      target="_blank"
                                    >
                                      Learn more about the risk calculation
                                    </Link>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ) : null}
                            {header.isPlaceholder ? null : header.id ===
                              "max_cvss" ? (
                              <Tooltip>
                                <TooltipTrigger>
                                  <CircleHelp className="w-4 h-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="relative font-normal">
                                    CVSS (Common Vulnerability Scoring System)
                                    is a standardized framework that rates
                                    security vulnerabilities on a scale from
                                    0-10. It measures the theoretical severity
                                    of a vulnerability, based on factors like
                                    attack complexity and impact.
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ) : null}
                            <SortingCaret
                              data-testid="sorting-cvss-value"
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
                    Array.from(Array(5).keys()).map((el) => (
                      <tr key={el} className="border-b">
                        <td className="p-4" colSpan={4}>
                          <Skeleton className="w-full h-[40px]" />
                        </td>
                      </tr>
                    ))}
                  {table.getRowModel().rows.map((row, i, arr) => (
                    <RiskHandlingRow
                      row={row}
                      index={i}
                      arrLength={arr.length}
                      key={row.original.packageName}
                      selectedVulnIds={selectedVulnIds}
                      onToggleVuln={handleToggleVuln}
                      onToggleAll={handleToggleAll}
                      onBulkAction={handleBulkAction}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4">{vulns && <CustomPagination {...vulns} />}</div>
        </div>
      )}
      <SbomDownloadModal
        artifacts={artifacts}
        showSBOMModal={showSBOMModal}
        setShowSBOMModal={setShowSBOMModal}
        pathname={pathname}
        assetName={asset?.name}
        assetVersionName={assetVersion?.name}
      />
      <DependencyRiskScannerDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        apiUrl={config.devguardApiUrlPublicInternet}
        frontendUrl={config.frontendUrl}
        devguardCIComponentBase={config.devguardCIComponentBase}
        devguardWebLatestScannerImage={latestScannerImage}
        assetVersion={assetVersion}
        artifacts={artifacts || []}
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
            description: `${count} vulnerability path${count !== 1 ? "s" : ""} accepted.`,
          });
          return true;
        }}
        description={
          <>
            You are about to accept the risk for {selectedOpenIds.length}{" "}
            selected vulnerability path
            {selectedOpenIds.length !== 1 ? "s" : ""}. This acknowledges you are
            aware of the vulnerability and its potential impact.
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
            description: `${count} vulnerability path${count !== 1 ? "s" : ""} marked as false positive.`,
          });
          return true;
        }}
        description={
          <>
            You are about to mark {selectedOpenIds.length} selected
            vulnerability path{selectedOpenIds.length !== 1 ? "s" : ""} as false
            positive.
          </>
        }
      />
    </Page>
  );
};

export default Index;
