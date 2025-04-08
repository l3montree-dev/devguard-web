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
import {
  ComponentPaged,
  License,
  LicenseResponse,
  Paged,
  ScoreCard,
} from "@/types/api/api";
import { beautifyPurl, classNames } from "@/utils/common";
import { buildFilterSearchParams } from "@/utils/url";
import {
  CalendarDateRangeIcon,
  CheckBadgeIcon,
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
import { osiLicenseHexColors } from "../../../../../../../../../utils/view";
import { Pagination } from "../../../../../../../../../components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
} from "../../../../../../../../../components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";

interface Props {
  components: Paged<ComponentPaged & { license: LicenseResponse }>;
  licenses: LicenseResponse[];
}

interface Dictionary {
  details: string[];
  name: string;
  reason: string;
  score: number;
  url: string;
  shortDescription: string;
}

const columnHelper = createColumnHelper<
  ComponentPaged & { license: LicenseResponse }
>();

const columnsDef: ColumnDef<
  ComponentPaged & { license: LicenseResponse },
  any
>[] = [
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
  columnHelper.accessor("license", {
    header: "License",
    id: "Dependency.license",
    cell: (row) =>
      (row.getValue() as License).licenseId === "unknown" ? (
        <Badge className="capitalize" variant={"outline"}>
          <ExclamationTriangleIcon
            className={"mr-1 h-4 w-4 text-muted-foreground"}
          />
          {(row.getValue() as License).licenseId}
        </Badge>
      ) : (
        <Tooltip>
          <TooltipTrigger>
            <Badge variant={"outline"}>
              <ScaleIcon className={"mr-1 h-4 w-4 text-muted-foreground"} />
              {(row.getValue() as License).licenseId}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex flex-col items-start justify-start gap-1">
              <span className="flex flex-row items-center text-sm font-bold">
                {(row.getValue() as License).isOsiApproved && (
                  <CheckBadgeIcon className="mr-1 inline-block h-4 w-4 text-green-500" />
                )}
                {(row.getValue() as License).name}
              </span>
              <span className="text-sm text-muted-foreground">
                {(row.getValue() as License).isOsiApproved
                  ? "OSI Approved"
                  : "Not OSI Approved"}
                ,{" "}
                <a
                  href={`https://opensource.org/licenses/${(row.getValue() as License).licenseId}`}
                  target="_blank"
                  className="text-sm font-semibold !text-muted-foreground underline"
                >
                  Open Source License
                </a>
              </span>
            </div>

            <span className="text-sm text-muted-foreground"></span>
          </TooltipContent>
        </Tooltip>
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

const Index: FunctionComponent<Props> = ({ components, licenses }) => {
  const assetMenu = useAssetMenu();
  const { branches, tags } = useAssetBranchesAndTags();

  const [datasets, setDatasets] = useState<{
    purl: string;
    scoreCard?: ScoreCard;
  }>();

  const { table } = useTable({
    data: components.data,
    columnsDef,
  });

  function dataPassthrough(data: ComponentPaged) {
    setDatasets({
      purl: data.dependency.purl,
      scoreCard: data.dependency.project?.scoreCard,
    });
  }

  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();
  const assetVersion = useActiveAssetVersion();

  const licenseToPercentMapEntries = useMemo(() => {
    const total = licenses.reduce((acc, curr) => acc + curr.count, 0);

    return licenses
      .map((license) => [license, (license.count / total) * 100] as const)
      .sort(([_aLicense, a], [_bLicense, b]) => (b as number) - (a as number));
  }, [licenses]);

  return (
    <Page
      Menu={assetMenu}
      title="Dependencies"
      description="Dependencies of the asset"
      Title={<AssetTitle />}
    >
      <div className="mb-10 flex flex-row items-start justify-between">
        <BranchTagSelector branches={branches} tags={tags} />

        <div>
          <span className="text-xs text-muted-foreground">Licenses</span>
          <span>
            <span className="flex flex-row overflow-hidden rounded-full">
              {licenseToPercentMapEntries.map(([el, percent], i, arr) => (
                <span
                  key={el.license.licenseId}
                  className={classNames(
                    "h-2",
                    i === arr.length - 1 ? "" : "border-r",
                  )}
                  style={{
                    width: percent + "%",
                    backgroundColor:
                      osiLicenseHexColors[el.license.licenseId] || "#eeeeee",
                  }}
                />
              ))}
            </span>
            <span className="mt-2 flex flex-row flex-wrap gap-2">
              {licenseToPercentMapEntries.map(([el, percent]) => (
                <span
                  className="whitespace-nowrap text-xs capitalize"
                  key={el.license.licenseId}
                >
                  <span
                    style={{
                      backgroundColor:
                        osiLicenseHexColors[el.license.licenseId] ?? "#eeeeee",
                    }}
                    className={classNames(
                      "mr-1 inline-block h-2 w-2 rounded-full text-xs ",
                    )}
                  />
                  {el.license.licenseId}{" "}
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
                  onClick={() => dataPassthrough(row.original)}
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
        <CustomPagination {...components} />
      </Section>

      {datasets && (
        <DependencyDialog
          open={true}
          setOpen={() => setDatasets(undefined)} //set dataset as undefined, so that it closes the dataset && condition and stops the rendering
          purl={datasets.purl}
          scoreCard={datasets.scoreCard}
        ></DependencyDialog>
      )}
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
      apiClient(url + "?" + params.toString()).then((r) => r.json()) as Promise<
        Paged<ComponentPaged>
      >,
      apiClient(url + "/licenses?" + params.toString()).then(
        (r) => r.json() as Promise<LicenseResponse[]>,
      ),
    ]);

    const licenseMap = licenses.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.license.licenseId]: curr.license,
      }),
      {} as Record<string, License>,
    );

    components.data = components.data.map((component) => ({
      ...component,
      license: licenseMap[component.dependency.license ?? ""] ?? {
        licenseId: "unknown",
        name: "unknown",
        count: 0,
      },
    }));

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
