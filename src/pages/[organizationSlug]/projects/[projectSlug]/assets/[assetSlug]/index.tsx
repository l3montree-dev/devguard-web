import DateString from "@/components/common/DateString";
import Filter from "@/components/common/Filter";
import FlawState from "@/components/common/FlawState";
import P from "@/components/common/P";
import SortingCaret from "@/components/common/SortingCaret";
import useFilter from "@/hooks/useFilter";
import {
  FilterableColumnDef,
  dateOperators,
  numberOperators,
} from "@/services/filter";
import { AssetDTO, FlawWithCVE, Paged } from "@/types/api/api";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import Page from "../../../../../../components/Page";
import Pagination from "../../../../../../components/common/Pagination";
import { withInitialState } from "../../../../../../decorators/withInitialState";
import { withSession } from "../../../../../../decorators/withSession";
import { getApiClientFromContext } from "../../../../../../services/flawFixApi";
import { classNames } from "../../../../../../utils/common";
import { withProject } from "@/decorators/withProject";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useProject";
import Link from "next/link";

interface Props {
  asset: AssetDTO;
  flaws: Paged<FlawWithCVE>;
}

const columnHelper = createColumnHelper<FlawWithCVE>();

const columnsDef = [
  {
    ...columnHelper.accessor("state", {
      header: "State",
      id: "state",
      cell: (row) => (
        <div className="flex flex-row">
          <FlawState state={row.getValue()} />
        </div>
      ),
    }),
  },
  {
    ...columnHelper.accessor("cve.cve", {
      header: "CVE",
      id: "cve.cve",
      cell: (row) => (
        <span className="whitespace-nowrap">{row.getValue()}</span>
      ),
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
    ...columnHelper.accessor("cve.description", {
      header: "Message",
      id: "message",
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
      id: "cve.cvss",
      cell: (row) => row.getValue(),
    }),
    operators: numberOperators,
  },
  {
    ...columnHelper.accessor("cve.epss", {
      header: "Exploit Prediction Scoring System",
      id: "cve.epss",
      cell: (row) => row.getValue(),
    }),
    operators: numberOperators,
  },
  {
    ...columnHelper.accessor("createdAt", {
      header: "First reported",
      id: "createdAt",
      cell: (row) => <DateString date={new Date(row.getValue())} />,
    }),
    operators: dateOperators,
  },
];

const Index: FunctionComponent<Props> = (props) => {
  const { sortingState, handleSort } = useFilter();

  const table = useReactTable({
    columns: columnsDef,
    data: props.flaws.data,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: handleSort,
    manualSorting: true,
    state: {
      sorting: sortingState,
    },
  });

  const router = useRouter();
  const activeOrg = useActiveOrg();
  const project = useActiveProject();

  return (
    <Page
      title={props.asset.name}
      Title={
        <span className="flex flex-row gap-2">
          <Link
            href={`/${activeOrg?.slug}`}
            className="hover:no-underline text-white"
          >
            {activeOrg?.name}
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="hover:no-underline text-white"
            href={`/${activeOrg?.slug}/projects/${project?.slug}`}
          >
            {project?.name}
          </Link>
          <span className="opacity-75">/</span>
          {props.asset.name}
        </span>
      }
    >
      <div className="mb-4">
        <Filter
          columnsDef={columnsDef.filter(
            (c): c is FilterableColumnDef => "operators" in c,
          )}
        />
      </div>
      <div className="border dark:border-slate-700 shadow-sm rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b dark:border-slate-700 dark:bg-slate-950 dark:text-white bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    className="text-left cursor-pointer p-4 break-normal"
                    onClick={header.column.getToggleSortingHandler()}
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
          <tbody className="text-sm dark:bg-slate-900 dark:text-white bg-white">
            {table.getRowModel().rows.map((row, i, arr) => (
              <tr
                onClick={() => {
                  router.push(router.asPath + "/flaws/" + row.original.id);
                }}
                className={classNames(
                  "align-top cursor-pointer transition-all",
                  i === arr.length - 1
                    ? ""
                    : "border-b dark:border-b-slate-700",
                  "hover:bg-slate-50 dark:hover:bg-slate-800",
                )}
                key={row.id}
              >
                {row.getVisibleCells().map((cell) => (
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

export const getServerSideProps = withSession(
  withInitialState(
    withProject(async (context: GetServerSidePropsContext) => {
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
    }),
  ),
);
