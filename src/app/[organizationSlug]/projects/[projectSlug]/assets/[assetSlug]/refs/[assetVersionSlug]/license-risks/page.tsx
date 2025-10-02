"use client";
import SortingCaret from "@/components/common/SortingCaret";
import { useAssetMenu } from "@/hooks/useAssetMenu";

import Page from "@/components/Page";
import { ArtifactDTO, LicenseRiskDTO, Paged } from "@/types/api/api";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { FunctionComponent, useMemo, useState } from "react";
import { beautifyPurl, classNames } from "@/utils/common";
import { QueryArtifactSelector } from "@/components/ArtifactSelector";
import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import CustomPagination from "@/components/common/CustomPagination";
import EcosystemImage from "@/components/common/EcosystemImage";
import EmptyParty from "@/components/common/EmptyParty";
import Section from "@/components/common/Section";
import LicenseRiskRow from "@/components/risk-handling/LicenseRiskRow";
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
import { usePathname, useSearchParams } from "next/navigation";
import useSWR from "swr";
import Severity from "../../../../../../../../../components/common/Severity";
import SbomDownloadModal from "../../../../../../../../../components/dependencies/SbomDownloadModal";
import VexDownloadModal from "../../../../../../../../../components/dependencies/VexDownloadModal";
import DependencyRiskScannerDialog from "../../../../../../../../../components/RiskScannerDialog";
import { useArtifacts } from "../../../../../../../../../context/AssetVersionContext";
import { useConfig } from "../../../../../../../../../context/ConfigContext";
import { useActiveAsset } from "../../../../../../../../../hooks/useActiveAsset";
import { fetcher } from "../../../../../../../../../data-fetcher/fetcher";
import useDebouncedQuerySearch from "../../../../../../../../../hooks/useDebouncedQuerySearch";
import useDecodedParams from "../../../../../../../../../hooks/useDecodedParams";
import useRouterQuery from "../../../../../../../../../hooks/useRouterQuery";
import { Skeleton } from "../../../../../../../../../components/ui/skeleton";

interface Props {
  vulns: Paged<LicenseRiskDTO>;
  artifacts: ArtifactDTO[];
}

const columnHelper = createColumnHelper<LicenseRiskDTO>();

const columnsDef: ColumnDef<LicenseRiskDTO, any>[] = [
  {
    ...columnHelper.accessor("componentPurl", {
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
    ...columnHelper.accessor("component.license", {
      header: "License",
      enableSorting: false,
      id: "licenseName",
      cell: (row) => <div className="flex flex-row">{row.getValue()}</div>,
    }),
  },
  {
    ...columnHelper.accessor("artifacts", {
      header: "Artifact",
      id: "artifactName",
      enableSorting: false,
      cell: (row) => (
        <div className="flex flex-row">
          <Severity gray risk={row.getValue()} />
        </div>
      ),
    }),
  },
  {
    ...columnHelper.accessor("finalLicenseDecision", {
      header: "Corrected to License",
      enableSorting: false,
      id: "finalLicenseDecision",
      cell: (row) => (
        <div className="flex flex-row">
          {Boolean(row.getValue()) ? row.getValue() : "Not yet corrected"}
        </div>
      ),
    }),
  },
];

const Index: FunctionComponent = () => {
  // fetch the project
  let { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    useDecodedParams() as {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
    };

  const searchParams = useSearchParams();

  const uri =
    "/organizations/" +
    organizationSlug +
    "/projects/" +
    projectSlug +
    "/assets/" +
    assetSlug +
    "/";

  const query = useMemo(() => {
    const p = buildFilterSearchParams(searchParams);
    if (searchParams?.has("state")) {
      const state = searchParams.get("state");
      if (!Boolean(state) || state === "open") {
        p.append("filterQuery[state][is]", "open");
      } else {
        p.append("filterQuery[state][is not]", "open");
      }
    }

    if (searchParams?.has("artifact")) {
      p.append(
        "filterQuery[artifact_license_risks.artifact_artifact_name][is]",
        searchParams.get("artifact") as string,
      );
    }

    return p;
  }, [searchParams]);

  const handleSearch = useDebouncedQuerySearch();

  const {
    data: vulns,
    error,
    isLoading,
  } = useSWR<Paged<LicenseRiskDTO>>(
    uri +
      "refs/" +
      assetVersionSlug +
      "/" +
      "license-risks?" +
      query.toString(),
    fetcher,
  );

  const { table } = useTable({
    columnsDef,
    data: vulns?.data || [],
  });
  const config = useConfig();

  const [showSBOMModal, setShowSBOMModal] = useState(false);
  const [showVexModal, setShowVexModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const assetMenu = useAssetMenu();
  const asset = useActiveAsset();
  const assetVersion = useActiveAssetVersion();

  const { branches, tags } = useAssetBranchesAndTags();
  const pathname = usePathname();
  const push = useRouterQuery();
  const artifacts = useArtifacts();

  return (
    <Page Menu={assetMenu} title={"Risk Handling"} Title={<AssetTitle />}>
      <div className="flex flex-row items-center justify-between">
        <BranchTagSelector branches={branches} tags={tags} />
      </div>

      <VexDownloadModal
        artifacts={artifacts}
        showVexModal={showVexModal}
        setShowVexModal={setShowVexModal}
        pathname={pathname || ""}
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
              searchParams?.has("state")
                ? (searchParams.get("state") as string)
                : "open"
            }
            value={searchParams?.get("state") ?? "open"}
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
            onChange={handleSearch}
            defaultValue={searchParams?.get("search") as string}
            placeholder="Search for cve, package name, message or scanner..."
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
                            <div>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                            </div>

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
                                    <span className="font-bold">
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
                      </tr>
                    ))}
                  {table.getRowModel().rows.map((row, i, arr) => (
                    <LicenseRiskRow
                      key={row.original.id}
                      risk={row.original}
                      index={i}
                      arrLength={arr.length}
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
        showSBOMModal={showSBOMModal}
        setShowSBOMModal={setShowSBOMModal}
        pathname={pathname || ""}
        artifacts={artifacts}
        assetName={asset?.name}
        assetVersionName={assetVersion?.name}
      />
      <DependencyRiskScannerDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        apiUrl={config.devguardApiUrlPublicInternet}
        frontendUrl={config.frontendUrl}
        devguardCIComponentBase={config.devguardCIComponentBase}
      />
    </Page>
  );
};

export default Index;
