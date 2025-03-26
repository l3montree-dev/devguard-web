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

import { FunctionComponent, useMemo, useRef, useState } from "react";

import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import CustomPagination from "@/components/common/CustomPagination";
import EcosystemImage from "@/components/common/EcosystemImage";
import Section from "@/components/common/Section";
import { withAssetVersion } from "@/decorators/withAssetVersion";
import { withContentTree } from "@/decorators/withContentTree";
import {
  useActiveAssetVersion,
  useAssetBranchesAndTags,
} from "@/hooks/useActiveAssetVersion";
import useTable from "@/hooks/useTable";
import { ComponentPaged, Paged } from "@/types/api/api";
import { beautifyPurl, classNames } from "@/utils/common";
import { buildFilterSearchParams } from "@/utils/url";
import {
  CalendarDateRangeIcon,
  ExclamationTriangleIcon,
  ScaleIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { GitBranch } from "lucide-react";
import Link from "next/link";
import SortingCaret from "../../../../../../../../../components/common/SortingCaret";
import { Badge } from "../../../../../../../../../components/ui/badge";
import {
  Button,
  buttonVariants,
} from "../../../../../../../../../components/ui/button";
import { useActiveAsset } from "../../../../../../../../../hooks/useActiveAsset";
import { useActiveProject } from "../../../../../../../../../hooks/useActiveProject";
import DateString from "../../../../../../../../../components/common/DateString";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogContent } from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-label";
import DependencyDialog from "./dependencyDialog";
import Page from "@/components/Page";

interface Props {
  components: Paged<ComponentPaged>;
  licenses: Record<string, number>;
}

const columnHelper = createColumnHelper<ComponentPaged>();

const columnsDef: ColumnDef<ComponentPaged, any>[] = [
  columnHelper.accessor("dependencyPurl", {
    header: "Package",
    id: "dependency_purl",
    cell: (row) => (
      <span className="flex flex-row items-start gap-2">
        <EcosystemImage packageName={row.getValue()} />
        {beautifyPurl(row.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("dependency.version", {
    header: "Version",
    id: "Dependency.version",
    cell: (row) =>
      row.getValue() && <Badge variant={"secondary"}>{row.getValue()}</Badge>,
  }),
  columnHelper.accessor("dependency.license", {
    header: "License",
    id: "Component.license",
    cell: (row) =>
      row.getValue() === "unknown" ? (
        <Badge variant={"outline"}>
          <ExclamationTriangleIcon
            className={"mr-1 h-4 w-4 text-muted-foreground"}
          />
          {row.getValue()}
        </Badge>
      ) : (
        <Badge variant={"outline"}>
          <ScaleIcon className={"mr-1 h-4 w-4 text-muted-foreground"} />
          {row.getValue()}
        </Badge>
      ),
  }),
  columnHelper.accessor("dependency.project.projectKey", {
    header: "Repository",
    id: "Dependency__ComponentProject.project_key",
    cell: (row) =>
      row.row.original.dependency?.project && (
        <div>
          <div className="mb-2">
            <a href={`//${row.getValue()}`} target="_blank">
              {row.getValue()}
            </a>
          </div>
          <Badge variant={"outline"} className="mr-1">
            <StarIcon className="mr-1 h-4 w-4 text-muted-foreground" />
            {row.row.original.dependency.project?.starsCount}
          </Badge>
          <Badge variant={"outline"}>
            <GitBranch className="mr-1 h-4 w-4 text-muted-foreground" />
            {row.row.original.dependency.project?.forksCount}
          </Badge>
        </div>
      ),
  }),

  columnHelper.accessor("dependency.project.scoreCardScore", {
    header: "OpenSSF Scorecard Score",
    id: "Dependency__ComponentProject.score_card_score", // tight coupling with database and SQL-Query
    cell: (row) => <div>{row.getValue()}</div>,
  }),
  columnHelper.accessor("dependency.published", {
    header: "Published",
    id: "Dependency.published",
    cell: (row) =>
      row.getValue() && (
        <div className="flex flex-row items-center gap-2">
          <CalendarDateRangeIcon className="w-4 text-muted-foreground" />
          <DateString date={new Date(row.getValue())} />
        </div>
      ),
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
  const assetMenu = useAssetMenu();
  const { branches, tags } = useAssetBranchesAndTags();
  const [open, setOpen] = useState(false);
  const [dataArray, setDataArray] = useState([]);

  const { table } = useTable({
    data: components.data,
    columnsDef,
  });

  function dataPassthrough(data: any) {
    console.log(data);
    setOpen(true);
    setDataArray(data);
  }

  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();
  const assetVersion = useActiveAssetVersion();

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
      <div className="mb-10 flex flex-row items-start justify-between">
        <BranchTagSelector branches={branches} tags={tags} />

        <div>
          <span className="text-xs text-muted-foreground">Licenses</span>
          <span>
            <span className="flex flex-row overflow-hidden rounded-full">
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
        </div>
      </div>

      <Section
        primaryHeadline
        forceVertical
        Button={
          <Link
            className={classNames(buttonVariants({ variant: "secondary" }))}
            href={
              `/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}/refs/${assetVersion?.name}/dependencies/graph?` +
              new URLSearchParams({
                scanner:
                  "github.com/l3montree-dev/devguard/cmd/devguard-scanner/sca",
              }).toString()
            }
          >
            Open Dependency Graph
          </Link>
        }
        description="Dependencies of the asset"
        title="Dependencies"
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
                  onClick={() =>
                    dataPassthrough(
                      row.original.dependency.project?.scoreCard.checks[0]
                        .documentation.url,
                    )
                  }
                  className={classNames(
                    "relative cursor-pointer bg-background align-top transition-all ",
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
      <DependencyDialog
        open={open}
        setOpen={setOpen}
        data={dataArray}
      ></DependencyDialog>
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
function useAssetVersion() {
  throw new Error("Function not implemented.");
}
