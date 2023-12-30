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
import { config } from "../../../../../../../../config";
import { withInitialState } from "../../../../../../../../decorators/withInitialState";
import { withSession } from "../../../../../../../../decorators/withSession";
import { getApiClientFromContext } from "../../../../../../../../services/flawFixApi";
import { classNames } from "../../../../../../../../utils/common";
import Pagination from "../../../../../../../../components/common/Pagination";
import DateString from "@/components/common/DateString";

interface Props {
  env: EnvDTO;
  flaws: Paged<FlawWithCVE>;
}

const columnHelper = createColumnHelper<FlawWithCVE>();

const Severity = ({ severity }: { severity: string }) => {
  const cls =
    severity === "CRITICAL"
      ? "bg-red-500 text-white"
      : severity === "HIGH"
      ? "bg-orange-500 text-white"
      : severity === "MEDIUM"
      ? "bg-yellow-500 text-black"
      : severity === "LOW"
      ? "text-white bg-green-500"
      : "text-white bg-gray-500";

  return (
    <div className="flex">
      <div
        className={classNames(
          cls + " px-2 py-1 whitespace-nowrap font-semibold rounded-full",
        )}
      >
        {severity}
      </div>
    </div>
  );
};

const columnsDef = [
  columnHelper.accessor("ruleId", {
    header: "Rule ID",
    cell: (row) => row.getValue(),
  }),
  columnHelper.accessor("message", {
    header: "Message",
    cell: (row) => (
      <div className="line-clamp-3">
        {row
          .getValue()
          ?.split("\n")
          .map((s) => <p key={s}>{s}</p>)}
      </div>
    ),
  }),

  columnHelper.accessor("cve.cvss", {
    header: "CVSS",
    cell: (row) => row.getValue(),
  }),
  columnHelper.accessor("cve.severity", {
    header: "Severity",
    cell: (row) => <Severity severity={row.getValue()} />,
  }),
  columnHelper.accessor("cve.exploitabilityScore", {
    header: "Exploitability Score",
    cell: (row) => row.getValue(),
  }),
  columnHelper.accessor("cve.impactScore", {
    header: "Impact Score",
    cell: (row) => row.getValue(),
  }),
  columnHelper.accessor("cve.attackVector", {
    header: "Attack Vector",
    cell: (row) => row.getValue(),
  }),
  columnHelper.accessor("createdAt", {
    header: "First reported",
    cell: (row) => <DateString date={new Date(row.getValue())} />,
  }),
];

const Index: FunctionComponent<Props> = (props) => {
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
  });

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
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th className="text-left p-4 break-normal" key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="text-sm">
            {table.getRowModel().rows.map((row, i) => (
              <tr
                className={classNames(
                  "align-top transition-all",
                  i % 2 === 0 ? "bg-gray-100" : "bg-white",
                  "hover:bg-gray-200",
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
          <tfoot>
            {table.getFooterGroups().map((footerGroup) => (
              <tr key={footerGroup.id}>
                {footerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </tfoot>
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

    // check for page and page size query params
    // if they are there, append them to the uri
    const page = (context.query.page as string) ?? "1";
    const pageSize = (context.query.pageSize as string) ?? "5";
    const [resp, flawResp] = await Promise.all([
      apiClient(uri),
      apiClient(uri + "flaws/?" + new URLSearchParams({ page, pageSize })),
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
