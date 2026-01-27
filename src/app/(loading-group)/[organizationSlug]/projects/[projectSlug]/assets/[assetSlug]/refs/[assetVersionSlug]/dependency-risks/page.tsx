"use client";

import SortingCaret from "@/components/common/SortingCaret";
import { useAssetMenu } from "@/hooks/useAssetMenu";

import Page from "@/components/Page";
import { Paged, VulnByPackage, VulnWithCVE } from "@/types/api/api";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { FunctionComponent, useCallback, useMemo, useState } from "react";

import { beautifyPurl, classNames, extractVersion } from "@/utils/common";

import { QueryArtifactSelector } from "@/components/ArtifactSelector";
import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import CustomPagination from "@/components/common/CustomPagination";
import EcosystemImage from "@/components/common/EcosystemImage";
import EmptyParty from "@/components/common/EmptyParty";
import Section from "@/components/common/Section";
import RiskHandlingRow from "@/components/risk-handling/RiskHandlingRow";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useActiveAssetVersion,
  useAssetBranchesAndTags,
} from "@/hooks/useActiveAssetVersion";
import useTable from "@/hooks/useTable";
import { buildFilterSearchParams } from "@/utils/url";
import { CircleHelp, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import Severity from "../../../../../../../../../../components/common/Severity";
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

const columnHelper = createColumnHelper<VulnByPackage>();

const columnsDef: ColumnDef<VulnByPackage, any>[] = [
  {
    ...columnHelper.accessor("packageName", {
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
          {extractVersion((row.original.vulns[0] as VulnWithCVE).componentPurl)}
        </Badge>
      </span>
    ),
  },
  {
    ...columnHelper.accessor("maxRisk", {
      header: "Max Risk",
      enableSorting: true,
      id: "max_risk",
      cell: (row) => (
        <div className="flex flex-row">
          <Severity risk={row.getValue()} />
        </div>
      ),
    }),
  },
  /*{
    ...columnHelper.accessor("avgRisk", {
      header: "Average Risk",
      id: "avg_risk",
      enableSorting: true,
      cell: (row) => row.getValue().toFixed(1),
    }),
  },*/
  {
    ...columnHelper.accessor("maxCvss", {
      header: "Max CVSS",
      id: "max_cvss",
      enableSorting: true,
      cell: (row) => (
        <div className="flex flex-row">
          <Severity gray risk={row.getValue()} />
        </div>
      ),
    }),
  },
  {
    ...columnHelper.accessor("vulnCount", {
      header: "Vulnerability Count",
      id: "dependency_vuln_count",
      enableSorting: true,
      cell: (row) => (
        <div className="flex">
          <Badge variant={"outline"}>{row.getValue()}</Badge>
        </div>
      ),
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

  const {
    data: vulns,
    isLoading,
    error,
  } = useSWR<Paged<VulnByPackage>>(
    uri +
      "refs/" +
      assetVersionSlug +
      "/" +
      "dependency-vulns/?" +
      queryWithState.toString(),
    fetcher,
  );

  const { data: vulnsToSync } = useSWR<Paged<VulnByPackage>>(
    uri + "refs/" + assetVersionSlug + "/" + "dependency-vulns/sync/",
    fetcher,
  );

  const handleSearch = useDebouncedQuerySearch();

  const { table } = useTable({
    columnsDef,
    data: vulns?.data || [],
  });

  return (
    <Page Menu={assetMenu} title={"Risk Handling"} Title={<AssetTitle />}>
      <div className="flex flex-row items-center justify-between">
        <BranchTagSelector branches={branches} tags={tags} />
        <div className="flex flex-row gap-2">
          <Button variant={"secondary"} onClick={() => setShowSBOMModal(true)}>
            Download SBOM
          </Button>
          <Button variant={"secondary"} onClick={() => setShowVexModal(true)}>
            Download VeX
          </Button>
          <Button onClick={() => setIsOpen(true)} variant="default">
            Identify Risks
          </Button>
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
        title="Identified Risks"
        description="This table shows all the identified risks for this repository."
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
      {vulnsToSync && vulnsToSync.data.length > 0 && (
        <div className="mb-4 flex flex-row justify-center">
          <Link
            href={pathname + "/sync/"}
            className={buttonVariants({
              variant: "secondary",
            })}
          >
            There are new Events from a upstream source. Click here to handle
            them.
          </Link>
        </div>
      )}
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
                          className="cursor-pointer break-normal p-4 text-left"
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
                    <RiskHandlingRow
                      row={row}
                      index={i}
                      arrLength={arr.length}
                      key={row.original.packageName}
                      selectedVulnIds={selectedVulnIds}
                      onToggleVuln={handleToggleVuln}
                      onToggleAll={handleToggleAll}
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
    </Page>
  );
};

export default Index;
