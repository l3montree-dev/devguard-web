"use client";

import { useAssetMenu } from "@/hooks/useAssetMenu";
import { useSession } from "@/context/SessionContext";
import Page from "@/components/Page";
import { Paged, VulnByPackage } from "@/types/api/api";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { FunctionComponent, useCallback, useMemo, useState } from "react";
import AcceptRiskDialog from "@/components/AcceptRiskDialog";
import FalsePositiveDialog from "@/components/FalsePositiveDialog";
import { QueryArtifactSelector } from "@/components/ArtifactSelector";
import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import CustomPagination from "@/components/common/CustomPagination";
import EmptyParty from "@/components/common/EmptyParty";
import Section from "@/components/common/Section";
import SortingCaret from "@/components/common/SortingCaret";
import RiskHandlingRow from "@/components/risk-handling/RiskHandlingRow";
import { AsyncButton, Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  useActiveAssetVersion,
  useAssetBranchesAndTags,
} from "@/hooks/useActiveAssetVersion";
import useTable from "@/hooks/useTable";
import { browserApiClient } from "@/services/devGuardApi";
import { buildFilterSearchParams } from "@/utils/url";
import { CircleHelp, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import SbomDownloadModal from "../../../../../../../../../../components/dependencies/SbomDownloadModal";
import VexDownloadModal from "../../../../../../../../../../components/dependencies/VexDownloadModal";
import DependencyRiskScannerDialog from "../../../../../../../../../../components/RiskScannerDialog";
import { Skeleton } from "../../../../../../../../../../components/ui/skeleton";
import { useArtifacts } from "../../../../../../../../../../context/AssetVersionContext";
import { useConfig } from "../../../../../../../../../../context/ConfigContext";
import { fetcher } from "../../../../../../../../../../data-fetcher/fetcher";
import { useActiveAsset } from "../../../../../../../../../../hooks/useActiveAsset";
import useDebouncedQuerySearch from "../../../../../../../../../../hooks/useDebouncedQuerySearch";
import useDecodedParams from "../../../../../../../../../../hooks/useDecodedParams";
import useDecodedPathname from "../../../../../../../../../../hooks/useDecodedPathname";
import useRouterQuery from "../../../../../../../../../../hooks/useRouterQuery";
import { documentationLinks } from "@/const/documentationLinks";

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
  const { session } = useSession();

  const assetMenu = useAssetMenu();
  const asset = useActiveAsset();
  const assetVersion = useActiveAssetVersion();

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
  } = useSWR<Paged<VulnByPackage>>(vulnsSwrKey, fetcher);

  const handleBulkAction = useCallback(
    async (params: {
      vulnIds: string[];
      status: string;
      justification: string;
      mechanicalJustification?: string;
    }) => {
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

      // revalidate the data
      await mutateVulns();
    },
    [uri, assetVersionSlug, mutateVulns],
  );

  const handleSearch = useDebouncedQuerySearch();

  const { table } = useTable({
    columnsDef,
    data: vulns?.data || [],
  });

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
          <Button variant={"secondary"} onClick={() => setShowSBOMModal(true)}>
            Share your SBOM
          </Button>
          <Button variant={"secondary"} onClick={() => setShowVexModal(true)}>
            Share your VEX
          </Button>
          {session && (
            <Button onClick={() => setIsOpen(true)} variant="default">
              Identify Risks
            </Button>
          )}
        </div>
      </div>
      <VexDownloadModal
        artifacts={artifacts}
        showVexModal={showVexModal}
        setShowVexModal={setShowVexModal}
        pathname={pathname}
        assetName={asset?.name}
        assetVersionName={assetVersion?.name}
      />
      <Section
        forceVertical
        primaryHeadline
        title="Identified Dependency Risks"
        description="This table shows all the identified dependency risks for this repository."
        className="mb-4 mt-4"
      >
        <div className="relative flex flex-row gap-2">
          <QueryArtifactSelector
            unassignPossible
            artifacts={artifacts.map((a) => a.artifactName)}
          />
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
          <Input
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={params?.get("search") as string}
            placeholder="Search for cve, package name, message or scanner..."
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 ">
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
      </Section>
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
          <div className="rounded-lg border shadow-sm">
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
                  {session && selectedVulnIds.size > 0 && (
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
                                  <CircleHelp className="w-4 h-4 text-gray-500" />
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
                                  <CircleHelp className="w-4 h-4 text-gray-500" />
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
                      hasSession={!!session}
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
