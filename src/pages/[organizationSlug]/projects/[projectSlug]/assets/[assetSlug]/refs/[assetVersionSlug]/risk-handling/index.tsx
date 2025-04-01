import SortingCaret from "@/components/common/SortingCaret";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withProject } from "@/decorators/withProject";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";

import {
  AssetVersionDTO,
  FlawByPackage,
  FlawWithCVE,
  Paged,
} from "@/types/api/api";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import Page from "@/components/Page";

import { withOrgs } from "@/decorators/withOrgs";
import { withSession } from "@/decorators/withSession";
import { getApiClientFromContext } from "@/services/devGuardApi";
import { beautifyPurl, classNames, extractVersion } from "@/utils/common";

import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import CustomPagination from "@/components/common/CustomPagination";
import EcosystemImage from "@/components/common/EcosystemImage";
import EmptyList from "@/components/common/EmptyList";
import Section from "@/components/common/Section";
import RiskHandlingRow from "@/components/risk-handling/RiskHandlingRow";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withAssetVersion } from "@/decorators/withAssetVersion";
import { withContentTree } from "@/decorators/withContentTree";
import { withOrganization } from "@/decorators/withOrganization";
import { useAssetBranchesAndTags } from "@/hooks/useActiveAssetVersion";
import { Loader2 } from "lucide-react";
import EmptyParty from "@/components/common/EmptyParty";
import { buttonVariants } from "@/components/ui/button";
import useTable from "@/hooks/useTable";
import { buildFilterQuery, buildFilterSearchParams } from "@/utils/url";

interface Props {
  exists: boolean;
  flaws: Paged<FlawByPackage>;
}

const columnHelper = createColumnHelper<FlawByPackage>();

const getMaxSemverVersionAndRiskReduce = (flaws: FlawWithCVE[]) => {
  // order the flaws by fixedVersion
  const orderedFlaws = flaws.sort((a, b) => {
    if (a.componentFixedVersion && b.componentFixedVersion) {
      return a.componentFixedVersion.localeCompare(b.componentFixedVersion);
    }
    return 0;
  });

  // remove all without fixed version
  const filteredFlaws = orderedFlaws.filter(
    (f) => f.componentFixedVersion !== null,
  );

  if (filteredFlaws.length === 0) {
    return null;
  }
  // aggregate the risk
  const totalRisk = filteredFlaws.reduce(
    (acc, f) => acc + f.rawRiskAssessment,
    0,
  );

  return {
    version:
      filteredFlaws[filteredFlaws.length - 1].componentFixedVersion ?? "",
    riskReduction: totalRisk,
  };
};

const columnsDef: ColumnDef<FlawByPackage, any>[] = [
  {
    ...columnHelper.accessor("packageName", {
      header: "Package",
      id: "packageName",
      cell: (row) => (
        <span className="flex flex-row gap-2">
          <span className="flex h-5 w-5 flex-row items-center justify-center">
            <EcosystemImage packageName={row.getValue()} />
          </span>
          {beautifyPurl(row.getValue())}
        </span>
      ),
    }),
  },
  {
    ...columnHelper.accessor("maxRisk", {
      header: "Max Risk",
      enableSorting: true,
      id: "max_risk",
      cell: (row) => (
        <div>
          <span className="whitespace-nowrap">{row.getValue().toFixed(1)}</span>
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
    ...columnHelper.accessor("totalRisk", {
      header: "Total Risk",
      id: "total_risk",
      enableSorting: true,
      cell: (row) => row.getValue().toFixed(1),
    }),
  },
  {
    ...columnHelper.accessor("flawCount", {
      header: "Flaw Count",
      id: "dependency_vuln_count",
      enableSorting: true,
      cell: (row) => row.getValue(),
    }),
  },
  {
    header: "Installed Version",
    id: "installed",
    enableSorting: false,
    cell: ({ row }: any) => (
      <span>
        <Badge variant={"secondary"}>
          {extractVersion((row.original.flaws[0] as FlawWithCVE).componentPurl)}
        </Badge>
      </span>
    ),
  },
  {
    header: "Action",
    id: "fixAvailable",
    enableSorting: false,
    cell: ({ row }: any) => {
      const versionAndReduction = getMaxSemverVersionAndRiskReduce(
        row.original.flaws,
      );
      if (versionAndReduction === null) {
        return <span className="text-muted-foreground">No fix available</span>;
      }
      return (
        <span>
          <span className="text-muted-foreground">Update to version</span>{" "}
          <span>
            <Badge variant={"secondary"}>{versionAndReduction.version}</Badge>
          </span>{" "}
          <span className="text-muted-foreground">to reduce total risk by</span>{" "}
          <span>{versionAndReduction.riskReduction.toFixed(1)}</span>
        </span>
      );
    },
  },
];

const Index: FunctionComponent<Props> = (props) => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const router = useRouter();
  const { table, isLoading, handleSearch } = useTable({
    columnsDef,
    data: props.flaws.data,
  });

  const assetMenu = useAssetMenu();
  const asset = useActiveAsset();

  const { branches, tags } = useAssetBranchesAndTags();

  return (
    <Page Menu={assetMenu} title={"Risk Handling"} Title={<AssetTitle />}>
      {!props.exists ? (
        <EmptyList
          title="You do not have any identified risks for this asset."
          description="Risk identification is the process of determining what risks exist in the asset and what their characteristics are. This process is done by identifying, assessing, and prioritizing risks."
          Button={
            <Link
              className={classNames(
                buttonVariants({
                  variant: "default",
                }),
                "!text-primary-foreground",
              )}
              href={`/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}/`}
            >
              Start identifying risks
            </Link>
          }
        />
      ) : table.getRowCount() === 0 &&
        Object.keys(router.query).length === 4 ? (
        <>
          <BranchTagSelector branches={branches} tags={tags} />

          <EmptyParty
            title="No identified risks"
            description="No identified risks for this asset."
          />
        </>
      ) : (
        <div>
          <BranchTagSelector branches={branches} tags={tags} />

          <Section
            forceVertical
            primaryHeadline
            title="Identified Risks"
            description="This table shows all the identified risks for this asset."
          >
            <div className="relative flex flex-row gap-2">
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
                placeholder="Search for cve, package name or message..."
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 ">
                {isLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
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
                    {table.getRowModel().rows.map((row, i, arr) => (
                      <RiskHandlingRow
                        row={row}
                        index={i}
                        arrLength={arr.length}
                        key={row.original.packageName}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-4">
              <CustomPagination {...props.flaws} />
            </div>
          </Section>
        </div>
      )}
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

    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/";

    let branches: string[] = [];
    let tags: string[] = [];

    let exists = false;

    if (asset.refs.length !== 0) {
      asset.refs.map((av: AssetVersionDTO) => {
        if (av.type === "branch") {
          branches.push(av.slug);
        } else if (av.type === "tag") {
          tags.push(av.slug);
        } else {
          throw new Error("Unknown asset version type " + av.type);
        }
      });
      const assetVersionSlugString = assetVersionSlug as string;
      if (
        branches.includes(assetVersionSlugString) ||
        tags.includes(assetVersionSlugString)
      ) {
        exists = true;
      } else {
        if (branches.includes("main")) {
          assetVersionSlug = "main";
          return {
            redirect: {
              destination: `/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/main/risk-handling`,
              permanent: false,
            },
          };
        } else if (branches.length > 0) {
          assetVersionSlug = branches[0];
          return {
            redirect: {
              destination: `/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${branches[0]}/risk-handling`,
              permanent: false,
            },
          };
        } else if (tags.length > 0) {
          assetVersionSlug = tags[0];
          return {
            redirect: {
              destination: `/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${tags[0]}/risk-handling`,
              permanent: false,
            },
          };
        }
      }
    }

    const filterQuery = buildFilterQuery(context);
    const query = buildFilterSearchParams(context);
    // translate the state query param to a filter query
    const state = context.query.state;
    if (!Boolean(state) || state === "open") {
      filterQuery["filterQuery[state][is]"] = "open";
    } else {
      filterQuery["filterQuery[state][is not]"] = "open";
    }

    Object.entries(filterQuery).forEach(([key, value]) => {
      query.append(key, value as string);
    });

    // check for page and page size query params
    // if they are there, append them to the uri
    const flawResp = await apiClient(
      uri + "refs/" + assetVersionSlug + "/" + "flaws/?" + query.toString(),
    );

    // fetch a personal access token from the user

    const flaws = await flawResp.json();

    return {
      props: {
        exists,
        flaws,
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
