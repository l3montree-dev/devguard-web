import DateString from "@/components/common/DateString";
import Filter from "@/components/common/Filter";
import useFilter from "@/hooks/useFilter";
import {
  FilterableColumnDef,
  dateOperators,
  numberOperators,
  stringOperators,
} from "@/services/filter";
import { EnvDTO, FlawWithCVE, Paged } from "@/types/api/api";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { GetServerSidePropsContext } from "next";
import { FunctionComponent } from "react";
import Page from "../../../../../../../../components/Page";
import { toast } from "../../../../../../../../components/Toaster";
import Button from "../../../../../../../../components/common/Button";
import Input from "../../../../../../../../components/common/Input";
import Pagination from "../../../../../../../../components/common/Pagination";
import { config } from "../../../../../../../../config";
import { withInitialState } from "../../../../../../../../decorators/withInitialState";
import { withSession } from "../../../../../../../../decorators/withSession";
import { getApiClientFromContext } from "../../../../../../../../services/flawFixApi";
import { classNames } from "../../../../../../../../utils/common";
import SortingCaret from "@/components/common/SortingCaret";
import { useRouter } from "next/router";
import Severity from "@/components/common/Severity";
import P from "@/components/common/P";
import FlawState from "@/components/common/FlawState";

interface Props {
  env: EnvDTO;
  flaws: Paged<FlawWithCVE>;
}

const columnHelper = createColumnHelper<FlawWithCVE>();

const columnsDef = [
  {
    ...columnHelper.accessor("state", {
      header: "State",
      id: "state",
      cell: (row) => <FlawState state={row.getValue()} />,
    }),
  },
  {
    ...columnHelper.accessor("ruleId", {
      header: "Rule ID",
      id: "ruleId",
      cell: (row) => row.getValue(),
    }),
  },
  {
    ...columnHelper.accessor("message", {
      header: "Message",
      id: "message",
      cell: (row) => (
        <div className="line-clamp-3">
          <P value={row.getValue()} />
        </div>
      ),
    }),
  },
  {
    ...columnHelper.accessor("cve.cvss", {
      header: "CVSS",
      id: "cve.cvss",
      cell: (row) => row.getValue(),
    }),
    operators: numberOperators,
  },
  {
    ...columnHelper.accessor("cve.severity", {
      header: "Severity",
      id: "cve.severity",
      cell: (row) => <Severity severity={row.getValue()} />,
    }),
    operators: stringOperators,
    filterValues: ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"],
  },
  {
    ...columnHelper.accessor("cve.exploitabilityScore", {
      header: "Exploitability Score",
      id: "cve.exploitabilityScore",
      cell: (row) => row.getValue(),
    }),
    operators: numberOperators,
  },
  {
    ...columnHelper.accessor("cve.impactScore", {
      header: "Impact Score",
      id: "cve.impactScore",
      cell: (row) => row.getValue(),
    }),
    operators: numberOperators,
  },
  {
    ...columnHelper.accessor("cve.attackVector", {
      header: "Attack Vector",
      id: "cve.attackVector",
      cell: (row) => row.getValue(),
    }),
    operators: stringOperators,
    filterValues: [
      "NETWORK",
      "ADJACENT_NETWORK",
      "LOCAL",
      "PHYSICAL",
      "UNKNOWN",
    ],
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

  const cmd =
    "cat report.sarif.json | curl -X POST -H 'Content-Type: application/json' -H 'Authorization: Bearer <PERSONAL ACCESS TOKEN>' -d @- " +
    config.flawFixApiUrl +
    "/api/v1/vulnreports/" +
    props.env.id;

  const handleCopy = () => {
    // use the clipboard api
    navigator.clipboard.writeText(cmd);
    toast({
      title: "Copied",
      msg: "Command copied to clipboard",
      intent: "success",
    });
  };

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

  return (
    <Page title={props.env.name}>
      <div className="text-sm mb-10">
        Adding a vulnerability report to this environment is as easy as running
        the following command:
        <div className="mt-2 gap-2 flex flex-row">
          <Input disabled value={cmd} />
          <Button onClick={handleCopy} className="whitespace-nowrap">
            Copy
          </Button>
          <Button
            href="/user-settings#pat"
            intent="primary"
            variant="outline"
            className="whitespace-nowrap"
          >
            Create new Personal Access Token
          </Button>
        </div>
      </div>
      <div className="mb-4">
        <Filter
          columnsDef={columnsDef.filter(
            (c): c is FilterableColumnDef => "operators" in c,
          )}
        />
      </div>
      <div className="border shadow-sm rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-100">
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
          <tbody className="text-sm">
            {table.getRowModel().rows.map((row, i, arr) => (
              <tr
                onClick={() => {
                  router.push(router.asPath + "/flaws/" + row.original.id);
                }}
                className={classNames(
                  "align-top cursor-pointer transition-all",
                  i === arr.length - 1 ? "" : "border-b",
                  "hover:bg-gray-100",
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
  withInitialState(async (context: GetServerSidePropsContext) => {
    // fetch the project
    const { organizationSlug, projectSlug, applicationSlug, envSlug } =
      context.params!;

    const apiClient = getApiClientFromContext(context);
    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/applications/" +
      applicationSlug +
      "/envs/" +
      envSlug +
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

    const [env, flaws] = await Promise.all([resp.json(), flawResp.json()]);

    return {
      props: {
        env,
        flaws,
      },
    };
  }),
);
