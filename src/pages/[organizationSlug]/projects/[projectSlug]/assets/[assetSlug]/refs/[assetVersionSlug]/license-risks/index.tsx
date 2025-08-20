import SortingCaret from "@/components/common/SortingCaret";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withProject } from "@/decorators/withProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";

import Page from "@/components/Page";
import { Paged, VulnWithCVE, licenseRisk } from "@/types/api/api";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { FunctionComponent, useState } from "react";

import { withOrgs } from "@/decorators/withOrgs";
import { withSession } from "@/decorators/withSession";
import { getApiClientFromContext } from "@/services/devGuardApi";
import { beautifyPurl, classNames, extractVersion } from "@/utils/common";

import { ArtifactSelector } from "@/components/ArtifactSelector";
import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import CustomPagination from "@/components/common/CustomPagination";
import EcosystemImage from "@/components/common/EcosystemImage";
import EmptyParty from "@/components/common/EmptyParty";
import Section from "@/components/common/Section";
import RiskHandlingRow from "@/components/risk-handling/RiskHandlingRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { withAssetVersion } from "@/decorators/withAssetVersion";
import { withContentTree } from "@/decorators/withContentTree";
import { withOrganization } from "@/decorators/withOrganization";
import {
  useActiveAssetVersion,
  useAssetBranchesAndTags,
} from "@/hooks/useActiveAssetVersion";
import useTable from "@/hooks/useTable";
import { buildFilterSearchParams } from "@/utils/url";
import { CircleHelp, Loader2 } from "lucide-react";
import Severity from "../../../../../../../../../components/common/Severity";
import SbomDownloadModal from "../../../../../../../../../components/dependencies/SbomDownloadModal";
import DependencyRiskScannerDialog from "../../../../../../../../../components/RiskScannerDialog";
import { config } from "../../../../../../../../../config";
import { useActiveAsset } from "../../../../../../../../../hooks/useActiveAsset";
import { maybeGetRedirectDestination } from "../../../../../../../../../utils/server";
import LicenseRiskRow from "@/components/risk-handling/LicenseRiskRow";

interface Props {
  apiUrl: string;
  vulns: Paged<licenseRisk>;
  artifacts: any[];
}

const columnHelper = createColumnHelper<licenseRisk>();

const getMaxSemverVersionAndRiskReduce = (vulns: VulnWithCVE[]) => {
  // order the vulns by fixedVersion
  const orderedVulns = vulns.sort((a, b) => {
    if (a.componentFixedVersion && b.componentFixedVersion) {
      return a.componentFixedVersion.localeCompare(b.componentFixedVersion);
    }
    return 0;
  });

  // remove all without fixed version
  const filteredVulns = orderedVulns.filter(
    (f) => f.componentFixedVersion !== null,
  );

  if (filteredVulns.length === 0) {
    return null;
  }
  // aggregate the risk
  const totalRisk = filteredVulns.reduce(
    (acc, f) => acc + f.rawRiskAssessment,
    0,
  );

  return {
    version:
      filteredVulns[filteredVulns.length - 1].componentFixedVersion ?? "",
    riskReduction: totalRisk,
  };
};

const columnsDef: ColumnDef<licenseRisk, any>[] = [
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
    ...columnHelper.accessor("licenseName", {
      header: "License",
      enableSorting: true,
      id: "licenseName",
      cell: (row) => <div className="flex flex-row">{row.getValue()}</div>,
    }),
  },
  {
    ...columnHelper.accessor("scannerID", {
      header: "Scanner",
      id: "scannerID",
      enableSorting: true,
      cell: (row) => (
        <div className="flex flex-row">
          <Severity gray risk={row.getValue()} />
        </div>
      ),
    }),
  },
  {
    ...columnHelper.accessor("finalLicenseDecision", {
      header: "Warning",
      enableSorting: true,
      id: "finalLicenseDecision",
      cell: (row) => <div className="flex flex-row">{row.getValue()}</div>,
    }),
  },
];

const Index: FunctionComponent<Props> = (props) => {
  const router = useRouter();
  const { table, isLoading, handleSearch } = useTable({
    columnsDef,
    data: props.vulns.data,
  });

  const [showSBOMModal, setShowSBOMModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const assetMenu = useAssetMenu();
  const asset = useActiveAsset();
  const assetVersion = useActiveAssetVersion();

  const { branches, tags } = useAssetBranchesAndTags();
  const pathname = router.asPath.split("?")[0];

  return (
    <Page Menu={assetMenu} title={"Risk Handling"} Title={<AssetTitle />}>
      <div className="flex flex-row items-center justify-between">
        <BranchTagSelector branches={branches} tags={tags} />
        <div className="flex flex-row gap-2">
          <Button variant={"secondary"} onClick={() => setShowSBOMModal(true)}>
            Download SBOM
          </Button>

          <Button onClick={() => setIsOpen(true)} variant="default">
            License Risks
          </Button>
        </div>
      </div>
      <Section
        forceVertical
        primaryHeadline
        title="Identified Risks"
        description="This table shows all the identified risks for this repository."
        className="mb-4 mt-4"
      >
        <div className="relative flex flex-row gap-2">
          <ArtifactSelector artifacts={props.artifacts} />
          <Tabs
            defaultValue={
              (router.query.state as string | undefined)
                ? (router.query.state as string)
                : "open"
            }
          >
            <TabsList>
              <TabsTrigger
                onClick={() =>
                  router.push({
                    query: {
                      ...router.query,
                      state: "open",
                    },
                  })
                }
                value="open"
              >
                Open
              </TabsTrigger>
              <TabsTrigger
                onClick={() =>
                  router.push({
                    query: {
                      ...router.query,
                      state: "closed",
                    },
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
            defaultValue={router.query.search as string}
            placeholder="Search for cve, package name, message or scanner..."
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 ">
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
      </Section>
      {!props.vulns.data.length ? (
        <div>
          <EmptyParty
            title="No matching results."
            description="Risk identification is the process of determining what risks exist in the asset and what their characteristics are. This process is done by identifying, assessing, and prioritizing risks."
          />
          <div className="mt-4">
            <CustomPagination {...props.vulns} />
          </div>
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
                              "packageName" ? (
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
                                  <div className="relative ">
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
                  {table.getRowModel().rows.map((row, i, arr) => (
                    <LicenseRiskRow
                      key={row.original.scannerID}
                      risk={row.original}
                      index={i}
                      arrLength={arr.length}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4">
            <CustomPagination {...props.vulns} />
          </div>
        </div>
      )}
      <SbomDownloadModal
        showSBOMModal={showSBOMModal}
        setShowSBOMModal={setShowSBOMModal}
        pathname={pathname}
        assetName={asset?.name}
        assetVersionName={assetVersion?.name}
      />
      <DependencyRiskScannerDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        apiUrl={props.apiUrl}
      />
    </Page>
  );
};

export default Index;

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext, { asset }) => {
    // fetch the project
    let { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
      context.params!;

    const apiClient = getApiClientFromContext(context);

    const licenseRiskMocks = [
      {
        packageName: "scanner-ossindex,scanner-snyk",
        licenseName: "web-frontend@1.4.3",
        assetId: "asset-frontend-42",
        finalLicenseDecision: "OPEN",
        createdAt: "2025-08-16T10:15:00Z",
        manualTicketCreation: false,
        componentPurl: "pkg:npm/lodash@4.17.21",
        scannerID: "idk1",
      },

      {
        packageName: "scanner-ossindex,scanner-snyk",
        licenseName: "web-frontend@1.4.4",
        assetId: "asset-frontend-42",
        finalLicenseDecision: "OPEN",
        createdAt: "2025-08-16T10:15:00Z",
        manualTicketCreation: false,
        componentPurl: "pkg:npm/lodash@4.17.21",
        scannerID: "idk2",
      },
      {
        packageName: "scanner-ossindex,scanner-snyk",
        licenseName: "web-frontend@1.4.5",
        assetId: "asset-frontend-42",
        finalLicenseDecision: "OPEN",
        createdAt: "2025-08-16T10:15:00Z",
        manualTicketCreation: false,
        componentPurl: "pkg:npm/lodash@4.17.21",
        scannerID: "idk3",
      },
    ];

    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/";

    const maybeRedirect = maybeGetRedirectDestination(
      asset,
      organizationSlug as string,
      projectSlug as string,
      assetVersionSlug as string,
    );
    if (maybeRedirect) {
      return maybeRedirect;
    }

    const query = buildFilterSearchParams(context);
    // translate the state query param to a filter query
    const state = context.query.state;
    if (!Boolean(state) || state === "open") {
      query.append("filterQuery[state][is]", "open");
    } else {
      query.append("filterQuery[state][is not]", "open");
    }
    console.log("query", query.toString());

    const artifact = context.query.artifact;
    if (artifact) {
      query.append("filterQuery[scanner_ids][any]", artifact as string);
    }

    // check for page and page size query params
    // if they are there, append them to the uri
    const v = await apiClient(
      uri + "refs/" + assetVersionSlug + "/" + "license-risks",
    );

    // fetch a personal access token from the user
    const vulns = await v.json();

    let artifactsData: string[] = [];
    const artifactsResp = await apiClient(
      uri + "refs/" + assetVersionSlug + "/dependency-vulns/artifacts/",
    );
    if (artifactsResp.ok) {
      artifactsData = await artifactsResp.json();
    }

    const licenseMockPaged: Paged<licenseRisk> = {
      data: licenseRiskMocks,
      total: 0,
      page: 0,
      pageSize: 0,
    };

    return {
      props: {
        vulns: licenseMockPaged,
        apiUrl: config.devguardApiUrlPublicInternet,
        artifacts: artifactsData,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    project: withProject,
    asset: withAsset,
    assetVersion: withAssetVersion,
    contentTree: withContentTree,
  },
);
