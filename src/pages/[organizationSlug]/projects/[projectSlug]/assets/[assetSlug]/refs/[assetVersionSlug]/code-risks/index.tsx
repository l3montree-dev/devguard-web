import SortingCaret from "@/components/common/SortingCaret";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withProject } from "@/decorators/withProject";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";

import Page from "@/components/Page";
import { FirstPartyVuln, Paged } from "@/types/api/api";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { FunctionComponent, useState } from "react";

import { withOrgs } from "@/decorators/withOrgs";
import { withSession } from "@/decorators/withSession";
import { getApiClientFromContext } from "@/services/devGuardApi";
import { classNames } from "@/utils/common";

import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import CustomPagination from "@/components/common/CustomPagination";
import EmptyList from "@/components/common/EmptyList";
import EmptyParty from "@/components/common/EmptyParty";
import Section from "@/components/common/Section";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withAssetVersion } from "@/decorators/withAssetVersion";
import { withContentTree } from "@/decorators/withContentTree";
import { withOrganization } from "@/decorators/withOrganization";
import { useAssetBranchesAndTags } from "@/hooks/useActiveAssetVersion";
import useTable from "@/hooks/useTable";
import { buildFilterQuery, buildFilterSearchParams } from "@/utils/url";
import { Loader2 } from "lucide-react";
import CodeRiskScannerDialog from "../../../../../../../../../components/CodeRiskScannerDialog";
import { CopyCodeFragment } from "../../../../../../../../../components/common/CopyCode";
import { Badge } from "../../../../../../../../../components/ui/badge";
import { config } from "../../../../../../../../../config";
import { maybeGetRedirectDestination } from "../../../../../../../../../utils/server";
import { defaultScanner } from "../../../../../../../../../utils/view";

interface Props {
  vulns: Paged<FirstPartyVuln>;
  apiUrl: string;
}

const columnHelper = createColumnHelper<FirstPartyVuln>();

const columnsDef: ColumnDef<FirstPartyVuln, any>[] = [
  columnHelper.accessor("uri", {
    header: "Filename",
    cell: (info) => {
      return (
        info.getValue() && (
          <div className="w-52">
            <CopyCodeFragment codeString={info.getValue()} />
          </div>
        )
      );
    },
  }),

  columnHelper.accessor("message", {
    header: "Message",
    cell: (info) => {
      return (
        <span className="text-sm text-muted-foreground">{info.getValue()}</span>
      );
    },
  }),
  columnHelper.accessor("scannerIds", {
    header: "Scanner",
    cell: (info) => {
      return (
        <Badge className="whitespace-nowrap" variant={"secondary"}>
          {info.getValue().replace(defaultScanner, "")}
        </Badge>
      );
    },
  }),
];

const Index: FunctionComponent<Props> = (props) => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { table, isLoading, handleSearch } = useTable({
    columnsDef,
    data: props.vulns.data,
  });

  const assetMenu = useAssetMenu();
  const asset = useActiveAsset();

  const { branches, tags } = useAssetBranchesAndTags();

  return (
    <Page Menu={assetMenu} title={"Risk Handling"} Title={<AssetTitle />}>
      <div className="flex flex-row items-center justify-between">
        <BranchTagSelector branches={branches} tags={tags} />
        <div className="flex flex-row gap-2">
          <Button onClick={() => setIsOpen(true)} variant="default">
            Identify Code-Risks
          </Button>
        </div>
      </div>
      {!props.vulns.data.length ? (
        <EmptyParty
          title="You do not have any identified risks for this asset."
          description="Risk identification is the process of determining what risks exist in the asset and what their characteristics are. This process is done by identifying, assessing, and prioritizing risks."
        />
      ) : (
        <div>
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
                <table className="w-full overflow-x-auto text-sm">
                  <thead className="border-b bg-card text-foreground">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            className="cursor-pointer whitespace-nowrap break-normal p-4 text-left"
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
                        onClick={() =>
                          router.push(
                            router.asPath.split("?")[0] + "/" + row.original.id,
                          )
                        }
                        className={classNames(
                          "relative cursor-pointer align-top transition-all",
                          i === arr.length - 1 ? "" : "border-b",
                          i % 2 != 0 && "bg-card/50",
                          "hover:bg-gray-50 dark:hover:bg-card",
                        )}
                        key={row.id}
                      >
                        {row.getVisibleCells().map((cell) => (
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
            </div>
            <div className="mt-4">
              <CustomPagination {...props.vulns} />
            </div>
          </Section>
        </div>
      )}
      <CodeRiskScannerDialog
        apiUrl={props.apiUrl}
        open={isOpen}
        onOpenChange={setIsOpen}
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
      uri +
        "refs/" +
        assetVersionSlug +
        "/" +
        "first-party-vulns/?" +
        query.toString(),
    );

    const vulns = await flawResp.json();

    return {
      props: {
        vulns,
        apiUrl: config.devguardApiUrlPublicInternet,
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
