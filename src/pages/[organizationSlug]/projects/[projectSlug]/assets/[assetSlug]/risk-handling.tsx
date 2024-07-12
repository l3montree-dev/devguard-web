import DateString from "@/components/common/DateString";
import Filter from "@/components/common/Filter";
import FlawState from "@/components/common/FlawState";
import SortingCaret from "@/components/common/SortingCaret";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withProject } from "@/decorators/withProject";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { useColumnVisibility } from "@/hooks/useColumnVisibility";
import useFilter from "@/hooks/useFilter";
import {
  FilterableColumnDef,
  dateOperators,
  numberOperators,
  stringOperators,
} from "@/services/filter";
import { AssetDTO, FlawWithCVE, Paged } from "@/types/api/api";
import { ViewColumnsIcon } from "@heroicons/react/24/outline";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect } from "react";
import Page from "../../../../../../components/Page";

import { withOrgs } from "../../../../../../decorators/withOrgs";
import { withSession } from "../../../../../../decorators/withSession";
import { getApiClientFromContext } from "../../../../../../services/devGuardApi";
import { classNames } from "../../../../../../utils/common";

import CustomPagination from "@/components/common/CustomPagination";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Section from "@/components/common/Section";
import EmptyList from "@/components/common/EmptyList";
import { Badge } from "@/components/ui/badge";
import { withOrganization } from "@/decorators/withOrganization";

interface Props {
  asset: AssetDTO;
  flaws: Paged<FlawWithCVE>;
}

const columnHelper = createColumnHelper<FlawWithCVE>();

const extractVersion = (purl: string) => {
  const parts = purl.split("@");
  const version = parts[parts.length - 1];
  if (version.startsWith("v")) {
    return version.substring(1);
  }
  return version;
};

const columnsDef = [
  {
    ...columnHelper.accessor("state", {
      header: "State",
      enableSorting: true,
      id: "state",
      cell: (row) => (
        <div className="flex flex-row">
          <FlawState state={row.getValue()} />
        </div>
      ),
    }),
    operators: stringOperators,
    filterValues: ["open", "fixed", "ignored"],
  },
  {
    ...columnHelper.accessor("cve.cve", {
      header: "CVE",
      enableSorting: true,
      id: "cve.cve",
      cell: (row) => (
        <div>
          <span className="whitespace-nowrap">{row.getValue()}</span>
        </div>
      ),
    }),
  },
  {
    ...columnHelper.accessor("rawRiskAssessment", {
      header: "Risk",
      id: "rawRiskAssessment",
      enableSorting: true,
      cell: (row) => row.getValue(),
    }),
  },
  {
    ...columnHelper.accessor("cve.cisaExploitAdd", {
      header: "CISA Exploit Add",
      id: "cve.cisaExploitAdd",
      enableSorting: true,
      cell: (row) => {
        const value = row.getValue();
        if (!value) {
          return null;
        }
        return <DateString date={new Date(value)} />;
      },
    }),
  },
  {
    ...columnHelper.accessor("cve.cisaActionDue", {
      header: "CISA Action Due",
      id: "cve.cisaActionDue",
      enableSorting: true,
      cell: (row) => {
        const value = row.getValue();
        if (!value) {
          return null;
        }
        return <DateString date={new Date(value)} />;
      },
    }),
  },
  {
    ...columnHelper.accessor("cve.cisaRequiredAction", {
      header: "CISA Required Action",
      id: "cve.cisaRequiredAction",
      enableSorting: true,
      cell: (row) => row.getValue(),
    }),
  },
  {
    ...columnHelper.accessor("arbitraryJsonData.packageName", {
      header: "Package",
      id: "packageName",
      cell: (row) => (
        <span className="whitespace-nowrap">{row.getValue()}</span>
      ),
    }),
  },
  {
    ...columnHelper.accessor("component.purlOrCpe", {
      header: "Installed Version",
      id: "installedVersion",
      cell: (row) => (
        <span className="whitespace-nowrap">
          {extractVersion(row.getValue())}
        </span>
      ),
    }),
  },
  {
    ...columnHelper.accessor("arbitraryJsonData.fixedVersion", {
      header: "Fixed in Version",
      id: "fixedVersion",
      cell: (row) => (
        <span className="whitespace-nowrap">{row.getValue() as string}</span>
      ),
    }),
  },
  {
    ...columnHelper.accessor("cve.description", {
      header: "Message",
      id: "message",
      enableSorting: true,
      cell: (row) => (
        <div className="line-clamp-3 max-w-5xl">
          <p>{row.getValue()}</p>
        </div>
      ),
    }),
  },
  {
    ...columnHelper.accessor("cve.cvss", {
      header: "Base CVSS",
      enableSorting: true,
      id: "cve.cvss",
      cell: (row) => row.getValue(),
    }),
    operators: numberOperators,
  },
  {
    ...columnHelper.accessor("cve.severity", {
      header: "Severity",
      enableSorting: true,
      id: "cve.severity",
      cell: (row) => (
        <span className="whitespace-nowrap">{row.getValue()}</span>
      ),
    }),
  },
  {
    ...columnHelper.accessor("cve.epss", {
      header: "Exploit Prediction Scoring System",
      id: "cve.epss",
      enableSorting: true,
      cell: (row) => row.getValue(),
    }),
    operators: numberOperators,
  },

  {
    ...columnHelper.accessor("createdAt", {
      header: "First reported",
      id: "createdAt",
      enableSorting: true,
      cell: (row) => (
        <span className="whitespace-nowrap">
          <DateString date={new Date(row.getValue())} />
        </span>
      ),
    }),
    operators: dateOperators,
  },
];

const Index: FunctionComponent<Props> = (props) => {
  const { sortingState, handleSort } = useFilter();
  const { visibleColumns, setVisibleColumns } = useColumnVisibility(
    "scaTable",
    {
      "cve.cisaActionDue": false,
      "cve.cisaExploitAdd": false,
      "cve.cisaRequiredAction": false,
      "cve.severity": false,
    },
  );
  const table = useReactTable({
    columns: columnsDef,
    data: props.flaws.data,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: handleSort,
    onColumnVisibilityChange: setVisibleColumns,
    manualSorting: true,
    state: {
      sorting: sortingState,
      columnVisibility: visibleColumns,
    },
  });

  const router = useRouter();
  const activeOrg = useActiveOrg();
  const project = useActiveProject();

  const assetMenu = useAssetMenu();
  const asset = useActiveAsset();

  const r =
    "/" +
    activeOrg.slug +
    "/projects/" +
    project?.slug +
    "/assets/" +
    asset?.slug;

  useEffect(() => {});
  return (
    <Page
      Menu={assetMenu}
      title={"Risk Handling"}
      Title={
        <span className="flex flex-row gap-2">
          <Link
            href={`/${activeOrg.slug}`}
            className="flex flex-row items-center gap-1 !text-white hover:no-underline"
          >
            {activeOrg.name}{" "}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Organization
            </Badge>
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="flex flex-row items-center gap-1 !text-white hover:no-underline"
            href={`/${activeOrg.slug}/projects/${project?.slug}`}
          >
            {project?.name}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Project
            </Badge>
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="flex items-center gap-1 text-white hover:no-underline"
            href={`/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}`}
          >
            {asset?.name}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Asset
            </Badge>
          </Link>
        </span>
      }
    >
      {table.getRowCount() === 0 ? (
        <EmptyList
          title="You do not have any identified risks for this asset."
          description="Risk identification is the process of determining what risks exist in the asset and what their characteristics are. This process is done by identifying, assessing, and prioritizing risks."
          buttonTitle="Start identifying risks"
          onClick={() =>
            router.push(
              `/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}/risk-identification`,
            )
          }
        />
      ) : (
        <Section
          forceVertical
          title="Identified Risks"
          description="This table shows all the identified risks for this asset."
          Button={
            <div className="mb-4 flex flex-row gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={buttonVariants({
                    variant: "secondary",
                  })}
                >
                  <ViewColumnsIcon className="mr-2 h-4 w-4" />
                  Columns
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {table.getAllLeafColumns().map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        checked={column.getIsVisible()}
                        onCheckedChange={column.getToggleVisibilityHandler()}
                        key={column.id}
                      >
                        {(column.columnDef.header as string) ?? ""}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              <Filter
                columnsDef={columnsDef.filter(
                  (c): c is FilterableColumnDef => "operators" in c,
                )}
              />
            </div>
          }
        >
          <div className="overflow-hidden rounded-lg border shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b bg-card text-foreground">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
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
                  <tr
                    onClick={() => {
                      router.push(r + "/flaws/" + row.original.id);
                    }}
                    className={classNames(
                      "relative cursor-pointer align-top transition-all",
                      i === arr.length - 1 ? "" : "border-b",
                      i % 2 != 0 && "bg-card",
                      "hover:bg-gray-50 dark:hover:bg-secondary",
                    )}
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell, i) => (
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
          <div className="mt-4">
            <CustomPagination {...props.flaws} />
          </div>
        </Section>
      )}
    </Page>
  );
};

export default Index;

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext) => {
    // fetch the project
    const { organizationSlug, projectSlug, assetSlug } = context.params!;

    const apiClient = getApiClientFromContext(context);
    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/";

    const filterQuery = Object.entries(context.query).filter(
      ([k]) => k.startsWith("filterQuery[") || k.startsWith("sort["),
    );

    // check for page and page size query params
    // if they are there, append them to the uri
    const page = (context.query.page as string) ?? "1";
    const pageSize = (context.query.pageSize as string) ?? "25";
    const [resp, flawResp] = await Promise.all([
      apiClient(uri),
      apiClient(
        uri +
          "flaws/?" +
          new URLSearchParams({
            page,
            pageSize,
            ...Object.fromEntries(filterQuery),
          }),
      ),
    ]);

    // fetch a personal access token from the user

    const [asset, flaws] = await Promise.all([resp.json(), flawResp.json()]);

    return {
      props: {
        asset,
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
  },
);
