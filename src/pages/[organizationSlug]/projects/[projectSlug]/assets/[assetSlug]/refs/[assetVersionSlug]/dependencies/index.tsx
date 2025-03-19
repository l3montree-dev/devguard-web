import Page from "@/components/Page";

import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrganization } from "@/decorators/withOrganization";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { getApiClientFromContext } from "@/services/devGuardApi";
import "@xyflow/react/dist/style.css";
import { GetServerSidePropsContext } from "next";

import { FunctionComponent, useMemo } from "react";

import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import CustomPagination from "@/components/common/CustomPagination";
import EcosystemImage from "@/components/common/EcosystemImage";
import Section from "@/components/common/Section";
import { withAssetVersion } from "@/decorators/withAssetVersion";
import { withContentTree } from "@/decorators/withContentTree";
import { useAssetBranchesAndTags } from "@/hooks/useActiveAssetVersion";
import useTable from "@/hooks/useTable";
import { ComponentPaged, Paged } from "@/types/api/api";
import { beautifyPurl, classNames } from "@/utils/common";
import { buildFilterSearchParams } from "@/utils/url";
import { ScaleIcon, StarIcon } from "@heroicons/react/24/outline";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { GitBranch } from "lucide-react";
import { Badge } from "../../../../../../../../../components/ui/badge";
import SortingCaret from "../../../../../../../../../components/common/SortingCaret";

interface Props {
  components: Paged<ComponentPaged>;
  licenses: Record<string, number>;
}

const columnHelper = createColumnHelper<ComponentPaged>();

const columnsDef: ColumnDef<ComponentPaged, any>[] = [
  columnHelper.accessor("componentPurl", {
    header: "Package",
    id: "component_purl",
    cell: (row) => (
      <span className="flex flex-row items-start gap-2">
        <EcosystemImage packageName={row.getValue()} />
        {beautifyPurl(row.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("component.version", {
    header: "Version",
    id: "Component.version",
    cell: (row) =>
      row.getValue() && <Badge variant={"secondary"}>{row.getValue()}</Badge>,
  }),
  columnHelper.accessor("component.project.projectKey", {
    header: "Repository",
    id: "Component__ComponentProject.project_key",
    cell: (row) =>
      row.row.original.component.project && (
        <div>
          <div className="mb-2">{row.getValue()}</div>
          <Badge variant={"outline"} className="mr-1">
            <StarIcon className="mr-1 h-4 w-4 text-muted-foreground" />
            {row.row.original.component.project?.starsCount}
          </Badge>
          <Badge variant={"outline"}>
            <GitBranch className="mr-1 h-4 w-4 text-muted-foreground" />
            {row.row.original.component.project?.forksCount}
          </Badge>
        </div>
      ),
  }),
  columnHelper.accessor("component.license", {
    header: "License",
    id: "Component.license",
    cell: (row) => (
      <Badge variant={"outline"}>
        <ScaleIcon className="mr-1 h-4 w-4 text-muted-foreground" />
        {row.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor("component.project.scoreCardScore", {
    header: "Scorecard Score",
    id: "Component__ComponentProject.score_card_score", // tight coupling with database and SQL-Query
    cell: (row) => <div>{row.getValue()}</div>,
  }),
];

const osiLicenseColors: Record<string, string> = {
  MIT: "bg-green-500",
  "Apache-2.0": "bg-blue-500",
  "GPL-3.0": "bg-red-500",
  "GPL-2.0": "bg-orange-500",
  "BSD-2-Clause": "bg-yellow-500",
  "BSD-3-Clause": "bg-yellow-500",
  "LGPL-3.0": "bg-purple-500",
  "AGPL-3.0": "bg-pink-500",
  "EPL-2.0": "bg-indigo-500",
  "MPL-2.0": "bg-teal-500",
  unknown: "bg-gray-500",
  "CC0-1.0": "bg-gray-600",
};

const Index: FunctionComponent<Props> = ({ components, licenses }) => {
  const activeOrg = useActiveOrg();
  const assetMenu = useAssetMenu();
  const { branches, tags } = useAssetBranchesAndTags();

  const { table } = useTable({
    data: components.data,
    columnsDef,
  });

  const licenseToPercentMapEntries = useMemo(() => {
    const total = Object.values(licenses).reduce((acc, curr) => acc + curr, 0);

    return Object.entries(licenses)
      .map(([license, count]) => [license, (count / total) * 100])
      .sort(([_aLicense, a], [_bLicense, b]) => (b as number) - (a as number));
  }, [licenses]);

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
        Button={
          <span className="w-72">
            <span className="flex w-72 flex-row overflow-hidden rounded-full">
              {licenseToPercentMapEntries.map(([license, percent], i, arr) => (
                <span
                  key={license}
                  className={classNames(
                    "h-2",
                    osiLicenseColors[license] ?? "",
                    i === arr.length - 1 ? "" : "border-r",
                  )}
                  style={{ width: percent + "%" }}
                />
              ))}
            </span>
            <span className="mt-2 flex flex-row flex-wrap gap-2">
              {licenseToPercentMapEntries.map(([license, percent]) => (
                <span className="whitespace-nowrap text-xs" key={license}>
                  <span
                    className={classNames(
                      "mr-1 inline-block h-2 w-2 rounded-full text-xs",
                      osiLicenseColors[license]
                        ? osiLicenseColors[license]
                        : "bg-gray-600",
                    )}
                  />
                  {license}{" "}
                  <span className="text-muted-foreground">
                    {Math.round(percent as number)}%
                  </span>
                </span>
              ))}
            </span>
          </span>
        }
      >
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
                      <div
                        className="flex flex-row gap-2"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
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
      "/components";

    const params = buildFilterSearchParams(context).toString();
    const [components, licenses] = await Promise.all([
      apiClient(url + "?" + params.toString()).then((r) => r.json()),
      apiClient(url + "/licenses?" + params.toString()).then((r) => r.json()),
    ]);

    return {
      props: {
        components,
        licenses,
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
