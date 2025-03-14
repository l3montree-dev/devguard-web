import Page from "@/components/Page";

import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrganization } from "@/decorators/withOrganization";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { getApiClientFromContext } from "@/services/devGuardApi";
import "@xyflow/react/dist/style.css";
import { GetServerSidePropsContext } from "next";

import { FunctionComponent } from "react";

import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import EcosystemImage from "@/components/common/EcosystemImage";
import Section from "@/components/common/Section";
import { withAssetVersion } from "@/decorators/withAssetVersion";
import { withContentTree } from "@/decorators/withContentTree";
import { useAssetBranchesAndTags } from "@/hooks/useActiveAssetVersion";
import useTable from "@/hooks/useTable";
import { ComponentPaged, Paged } from "@/types/api/api";
import { beautifyPurl, classNames } from "@/utils/common";
import { buildFilterSearchParams } from "@/utils/url";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { useRouter } from "next/router";
import CustomPagination from "@/components/common/CustomPagination";
import { Badge } from "../../../../../../../../../components/ui/badge";
import { ScaleIcon, StarIcon } from "@heroicons/react/24/outline";

interface Props {
  components: Paged<ComponentPaged>;
}

const columnHelper = createColumnHelper<ComponentPaged>();

const columnsDef: ColumnDef<ComponentPaged, any>[] = [
  columnHelper.accessor("componentPurl", {
    header: "Package",
    id: "componentPurl",
    cell: (row) => (
      <span className="flex flex-row gap-2">
        <span className="flex h-5 w-5 flex-row items-center justify-center">
          <EcosystemImage packageName={row.getValue()} />
        </span>
        {beautifyPurl(row.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("component.version", {
    header: "Version",
    id: "component.version",
    cell: (row) => <Badge variant={"secondary"}>{row.getValue()}</Badge>,
  }),
  columnHelper.accessor("component.project.id", {
    header: "Repository",
    id: "component.project.id",
    cell: (row) => (
      <div>
        <div className="mb-2">{row.getValue()}</div>
        <Badge variant={"outline"} className="mr-1">
          <StarIcon className="mr-1 h-4 w-4 text-muted-foreground" />
          {row.row.original.component.project.starsCount}
        </Badge>
        <Badge variant={"outline"}>
          <StarIcon className="mr-1 h-4 w-4 text-muted-foreground" />
          {row.row.original.component.project.forksCount}
        </Badge>
      </div>
    ),
  }),
  columnHelper.accessor("component.project.license", {
    header: "License",
    id: "component.project.license",
    cell: (row) => (
      <Badge variant={"outline"}>
        <ScaleIcon className="mr-1 h-4 w-4 text-muted-foreground" />
        {row.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor("component.project.scoreCard.overallScore", {
    header: "Scorecard Score",
    id: "component.project.scoreCard.overallScore",
    cell: (row) => <div>{row.getValue()}</div>,
  }),
];

const Index: FunctionComponent<Props> = ({ components }) => {
  const activeOrg = useActiveOrg();
  const assetMenu = useAssetMenu();
  const project = useActiveProject();
  const asset = useActiveAsset()!;
  const { branches, tags } = useAssetBranchesAndTags();

  const router = useRouter();

  const { table } = useTable({
    data: components.data,
    columnsDef,
  });

  return (
    <Page
      Menu={assetMenu}
      title="Overview"
      description="Overview of the asset"
      Title={<AssetTitle />}
    >
      <BranchTagSelector branches={branches} tags={tags} />
      <Section
        primaryHeadline
        forceVertical
        description="Dependencies of the asset"
        title="Dependencies"
      >
        {" "}
        <div className="overflow-hidden rounded-lg border shadow-sm">
          <table className="w-full table-fixed overflow-x-auto text-sm">
            <thead className="border-b bg-card text-foreground">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      className="cursor-pointer break-normal p-4 text-left"
                      key={header.id}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, index, arr) => (
                <tr
                  className={classNames(
                    "relative cursor-pointer bg-background align-top transition-all",
                    index === arr.length - 1 ? "" : "border-b",
                    index % 2 != 0 && "bg-card/50",
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
        <CustomPagination {...components} />
      </Section>
    </Page>
  );
};
export default Index;

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext) => {
    const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
      context.params!;

    const apiClient = getApiClientFromContext(context);

    const url =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/refs/" +
      assetVersionSlug +
      "/components?" +
      buildFilterSearchParams(context).toString();
    const [components] = await Promise.all([
      apiClient(url).then((r) => r.json()),
    ]);

    return {
      props: {
        components,
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
