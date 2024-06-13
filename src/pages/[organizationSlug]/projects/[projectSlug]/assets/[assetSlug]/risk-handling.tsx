import DateString from "@/components/common/DateString";
import Filter from "@/components/common/Filter";
import FlawState from "@/components/common/FlawState";
import P from "@/components/common/P";
import SortingCaret from "@/components/common/SortingCaret";
import { withProject } from "@/decorators/withProject";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useFilter from "@/hooks/useFilter";
import { useActiveProject } from "@/hooks/useActiveProject";
import {
  FilterableColumnDef,
  dateOperators,
  numberOperators,
  stringOperators,
} from "@/services/filter";
import { AssetDTO, FlawWithCVE, Paged } from "@/types/api/api";
import {
  Cell,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useState } from "react";
import Page from "../../../../../../components/Page";
import Pagination from "../../../../../../components/common/Pagination";
import { withOrg } from "../../../../../../decorators/withOrg";
import { withSession } from "../../../../../../decorators/withSession";
import { getApiClientFromContext } from "../../../../../../services/flawFixApi";
import { classNames } from "../../../../../../utils/common";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { useColumnVisibility } from "@/hooks/useColumnVisibility";
import Button from "@/components/common/Button";
import { ViewColumnsIcon } from "@heroicons/react/24/outline";
import PopupMenu from "@/components/common/PopupMenu";
import PopupMenuItem from "@/components/common/PopupMenuItem";
import Checkbox from "@/components/common/Checkbox";
import SecRequirementDialog from "@/components/common/SecRequirementDialog";

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
      header: "Angepasster CVSS",
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
          <P value={row.getValue()} />
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

  useEffect(() => {});
  return (
    <Page
      Menu={assetMenu}
      title={"Risk Handling"}
      Title={
        <span className="flex flex-row gap-2">
          <Link
            href={`/${activeOrg?.slug}`}
            className="text-white hover:no-underline"
          >
            {activeOrg?.name}
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="text-white hover:no-underline"
            href={`/${activeOrg?.slug}/projects/${project?.slug}`}
          >
            {project?.name}
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="text-white hover:no-underline"
            href={`/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}`}
          >
            {asset?.name}
          </Link>
          <span className="opacity-75">/</span>
          <span>Risk Handling</span>
        </span>
      }
    >
      <div className="mb-4 flex flex-row gap-2">
        <PopupMenu
          Button={
            <Button
              Icon={<ViewColumnsIcon />}
              intent="primary"
              variant="outline"
            >
              Columns
            </Button>
          }
        >
          {table.getAllLeafColumns().map((column) => {
            return (
              <div className="whitespace-nowrap p-2" key={column.id}>
                <Checkbox
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                  label={(column.columnDef.header as string) ?? ""}
                />
              </div>
            );
          })}
        </PopupMenu>
        <Filter
          columnsDef={columnsDef.filter(
            (c): c is FilterableColumnDef => "operators" in c,
          )}
        />
      </div>

      <div className="overflow-hidden rounded-lg border shadow-sm dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-white">
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
          <tbody className="bg-white text-sm dark:bg-gray-900 dark:text-white">
            {table.getRowModel().rows.map((row, i, arr) => (
              <tr
                onClick={() => {
                  router.push(router.asPath + "/flaws/" + row.original.id);
                }}
                className={classNames(
                  "relative cursor-pointer align-top transition-all",
                  i === arr.length - 1 ? "" : "border-b dark:border-b-gray-700",
                  "hover:bg-gray-50 dark:hover:bg-gray-800",
                )}
                key={row.id}
              >
                {row.getVisibleCells().map((cell, i) => (
                  <td className="p-4" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <Pagination {...props.flaws} />
      </div>
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
    console.log("Asset:", asset, "flaw:", flaws.data);
    //console.log("flaw:", flaws.data);
    //console.log("Asset:", asset);

    return {
      props: {
        asset,
        flaws,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrg,
    project: withProject,
    asset: withAsset,
  },
);
