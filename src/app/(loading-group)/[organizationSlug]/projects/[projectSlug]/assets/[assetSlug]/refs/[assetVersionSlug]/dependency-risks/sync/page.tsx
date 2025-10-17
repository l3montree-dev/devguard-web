"use client";
import AssetTitle from "@/components/common/AssetTitle";
import { FunctionComponent, use, useEffect, useMemo, useState } from "react";
import Page from "@/components/Page";
import {
  DependencyVuln,
  DetailedDependencyVulnDTO,
  ExpandedVulnDTOState,
  Paged,
  VulnByPackage,
  VulnWithCVE,
} from "@/types/api/api";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { BranchTagSelector } from "@/components/BranchTagSelector";
import {
  useActiveAssetVersion,
  useAssetBranchesAndTags,
} from "@/hooks/useActiveAssetVersion";
import { QueryArtifactSelector } from "@/components/ArtifactSelector";
import { useArtifacts } from "@/context/AssetVersionContext";
import EcosystemImage from "@/components/common/EcosystemImage";
import Severity from "@/components/common/Severity";
import { beautifyPurl, classNames, extractVersion } from "@/utils/common";
import {
  createColumnHelper,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "@/data-fetcher/fetcher";
import CustomPagination from "@/components/common/CustomPagination";
import EmptyParty from "@/components/common/EmptyParty";
import SortingCaret from "@/components/common/SortingCaret";
import RiskHandlingRow from "@/components/risk-handling/RiskHandlingRow";
import useTable from "@/hooks/useTable";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CircleHelp, Loader2 } from "lucide-react";
import Section from "@/components/common/Section";

import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { buildFilterSearchParams } from "@/utils/url";
import { usePathname, useSearchParams } from "next/navigation";
import useDecodedParams from "@/hooks/useDecodedParams";
import VulnState from "@/components/common/VulnState";
import { Switch } from "@/components/ui/switch";
import { VulnDTO, VulnEventDTO } from "@/types/api/api";
import { AsyncButton } from "@/components/ui/button";
import { toast } from "sonner";
import { TabsList } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import useDebouncedQuerySearch from "@/hooks/useDebouncedQuerySearch";
import Link from "next/link";
import { browserApiClient } from "@/services/devGuardApi";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveProject } from "@/hooks/useActiveProject";

const columnHelper = createColumnHelper<DetailedDependencyVulnDTO>();

const allowedStates: VulnDTO["state"][] = [
  "open",
  "fixed",
  "accepted",
  "falsePositive",
  "markedForTransfer",
];

const getState = (
  upstream: number,
  events: VulnEventDTO[],
): ExpandedVulnDTOState => {
  for (let i = events.length - 1; i >= 0; i--) {
    if (
      events[i].upstream === upstream &&
      allowedStates.includes(events[i].type as VulnDTO["state"])
    ) {
      return events[i].type as VulnDTO["state"];
    }
  }
  return "not-found";
};

const getJustification = (
  upstream: number,
  events: VulnEventDTO[],
): string | null => {
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].upstream === upstream && events[i].justification) {
      return events[i].justification;
    }
  }
  return null;
};

const baseColumnsDef: ColumnDef<DetailedDependencyVulnDTO, any>[] = [
  {
    header: "CVEID / CVSS",
    id: "cvss",
    enableSorting: false,
    cell: ({ row }: any) => (
      <div className="flex flex-col justify-start gap-2">
        <div className="text-foreground">{row.original.cveID}</div>
        <div className="w-fit">
          <Severity gray risk={row.original.cve.cvss ?? 0} />
        </div>
      </div>
    ),
  },
  {
    ...columnHelper.accessor("componentPurl", {
      header: "Package / Version",
      id: "packageName",
      cell: (row) => (
        <div className="flex flex-col justify-start gap-2">
          <span className="flex flex-row gap-2">
            <div className="flex h-5 w-5 flex-row items-center justify-center">
              <EcosystemImage packageName={row.getValue()} />
            </div>
            <div className="flex-1 text-foreground">{row.getValue()}</div>
          </span>
        </div>
      ),
    }),
  },
  {
    header: "Actual State",
    id: "actualState",
    enableSorting: false,
    cell: ({ row }: any) => (
      <div className="w-fit">
        <VulnState state={getState(2, row.original.events)} />
      </div>
    ),
  },
  {
    header: "Upstream State",
    id: "upstreamState",
    enableSorting: false,
    cell: ({ row }: any) => (
      <div className="w-fit">
        <VulnState state={getState(1, row.original.events)} />
      </div>
    ),
  },
  {
    header: "Upstream Justification",
    id: "upstreamJustification",
    enableSorting: false,
    cell: ({ row }: any) => (
      <span className="text-foreground">
        {getJustification(1, row.original.events)}
      </span>
    ),
  },
];

const Index: FunctionComponent = () => {
  const assetMenu = useAssetMenu();
  const { branches, tags } = useAssetBranchesAndTags();
  const artifacts = useArtifacts();
  const pathname = usePathname();
  const [vulnsToUpdate, setVulnsToUpdate] = useState<string[]>([]);

  const activeOrg = useActiveOrg();
  const project = useActiveProject()!;

  const asset = useActiveAsset()!;
  const assetVersion = useActiveAssetVersion();

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
  } = useSWR<Paged<DetailedDependencyVulnDTO>>(
    uri +
      "refs/" +
      assetVersionSlug +
      "/" +
      "dependency-vulns/sync/?" +
      query.toString(),
    fetcher,
  );

  const handleSearch = useDebouncedQuerySearch();
  const params = useSearchParams();


  useEffect(() => {
    if (vulns?.data) {
      setVulnsToUpdate(vulns.data.map((v) => v.id));
    }
  }, [vulns?.data]);

  const columnsDef = [
    baseColumnsDef[0],
    baseColumnsDef[1],

    {
      header: "Actual State",
      id: "actualState",
      enableSorting: false,
      cell: ({ row }: any) => (
        <div
          className={`w-fit rounded-full ${!vulnsToUpdate?.includes(row.original.id) ? "border border-yellow-300" : ""}`}
        >
          <VulnState state={getState(2, row.original.events)} />
        </div>
      ),
    },
    {
      header: "Upstream State",
      id: "upstreamState",
      enableSorting: false,
      cell: ({ row }: any) => (
        <div
          className={`w-fit rounded-full ${vulnsToUpdate?.includes(row.original.id) ? "border border-yellow-300" : ""}`}
        >
          <VulnState state={getState(1, row.original.events)} />
        </div>
      ),
    },

    baseColumnsDef[4],

    {
      header: "Upstream State Sync",
      id: "upstreamSync",
      enableSorting: false,
      cell: ({ row }: any) => (
        <div className="w-full" onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={vulnsToUpdate?.includes(row.original.id) ?? false}
            onCheckedChange={(checked) => {
              if (checked) {
                setVulnsToUpdate((prev) =>
                  prev?.includes(row.original.id)
                    ? prev
                    : [...prev, row.original.id],
                );
              } else {
                setVulnsToUpdate(
                  (prev) => prev?.filter((id) => id !== row.original.id) || [],
                );
              }
            }}
          />
        </div>
      ),
    },
  ];

  const { table } = useTable({
    columnsDef,
    data: vulns?.data || [],
  });

  const handleVulnsSync = async () => {
    try {
      const artifactName = searchParams?.get("artifact");
      if (!artifactName) {
        toast.error("Please select an artifact to sync vulnerabilities.");
        return;
      }

      interface SyncRequestBody {
        vulnID: string;
        event: VulnEventDTO;
      }

      let vulnsReq: SyncRequestBody[] = [];

      for (const vuln of vulns?.data || []) {
        if (vulnsToUpdate.includes(vuln.id)) {
          vulnsReq.push({
            vulnID: vuln.id,
            //the last event with upstream 2
            event: vuln.events
              .slice()
              .reverse()
              .find((e) => e.upstream === 2) as VulnEventDTO,
          });
        }
      }

      const response = await browserApiClient(
        "/api/v1/organizations/" +
          activeOrg.slug +
          "/projects/" +
          project.slug +
          "/assets/" +
          asset.slug +
          "/refs/" +
          assetVersion?.slug +
          "/dependency-vulns/sync/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vulnsReq,
          }),
        },
        "",
      );

      if (!response.ok) {
        throw new Error("Failed to sync vulnerabilities");
      }

      toast.success("Vulnerabilities synced successfully");

    } catch (error) {
      console.error("Error syncing vulnerabilities:", error);
      toast.error("Error syncing vulnerabilities");
    }
  };

  return (
    <Page Menu={assetMenu} title={"Risk Handling"} Title={<AssetTitle />}>
      <div className="flex flex-row items-center justify-between">
        <BranchTagSelector branches={branches} tags={tags} />
      </div>
      <Section
        forceVertical
        primaryHeadline
        title="Identified Events from Upstream to Sync"
        description="This table shows all the new identified events from upstream that can be synced to your actual state."
        className="mb-4 mt-4"
      >
        <div className="relative flex flex-row gap-2">
          <QueryArtifactSelector
            unassignPossible
            artifacts={artifacts.map((a) => a.artifactName)}
          />

          <Input
            onChange={handleSearch}
            defaultValue={params?.get("search") as string}
            placeholder="Search for cve, package name or message ..."
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
          <div className="overflow-hidden rounded-lg border shadow-sm">
            <div className="overflow-auto">
              <table className="w-full table-fixed overflow-x-auto text-sm">
                <thead className="border-b bg-card text-foreground">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          className="w-40 cursor-pointer break-normal p-4 text-left"
                          onClick={
                            header.column.columnDef.enableSorting
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                          key={header.id}
                        >
                          <div className="flex flex-row items-center gap-2">
                            {header.isPlaceholder ? null : header.id ===
                              "fixAvailable" ? (
                              <Badge className="">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                              </Badge>
                            ) : (
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
                          <Skeleton className="w-1/2 h-[20px]" />
                        </td>
                        <td className="p-4">
                          <Skeleton className="w-full h-[40px]" />
                        </td>
                      </tr>
                    ))}
                  {table.getRowModel().rows.map((row, i, arr) => (
                    <tr
                      className={classNames(
                        "relative cursor-pointer align-top transition-all",
                        i === arr.length - 1 ? "" : "border-b",
                        i % 2 !== 0 && "bg-card/50",
                        "hover:bg-gray-50 dark:hover:bg-card",
                      )}
                      key={row.original.componentPurl + row.original.cveID}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td className="p-4" key={cell.id}>
                          {cell.column.id === "upstreamSync" ? (
                            flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )
                          ) : (
                            <Link
                              href={
                                pathname +
                                "/../../dependency-risks/" +
                                row.original.id
                              }
                              className="text-foreground"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </Link>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <AsyncButton onClick={handleVulnsSync}>
              Sync Vulnerabilities
            </AsyncButton>
          </div>
          <div className="mt-4">{vulns && <CustomPagination {...vulns} />}</div>
        </div>
      )}
    </Page>
  );
};
export default Index;
