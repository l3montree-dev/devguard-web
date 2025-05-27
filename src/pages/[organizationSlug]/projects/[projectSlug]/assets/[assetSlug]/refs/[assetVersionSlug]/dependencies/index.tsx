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

import { FunctionComponent, useMemo, useState } from "react";

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
  Component,
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
  ChevronDoubleDownIcon,
  ExclamationTriangleIcon,
  ScaleIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { ChevronDownIcon, GitBranch } from "lucide-react";
import Link from "next/link";
import DateString from "../../../../../../../../../components/common/DateString";
import SortingCaret from "../../../../../../../../../components/common/SortingCaret";
import { Badge } from "../../../../../../../../../components/ui/badge";
import {
  Button,
  buttonVariants,
} from "../../../../../../../../../components/ui/button";
import { useActiveAsset } from "../../../../../../../../../hooks/useActiveAsset";
import { useActiveProject } from "../../../../../../../../../hooks/useActiveProject";

import Page from "@/components/Page";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import DependencyDialog from "../../../../../../../../../components/DependencyDialog";
import OpenSsfScore from "../../../../../../../../../components/common/OpenSsfScore";
import {
  Tooltip,
  TooltipContent,
} from "../../../../../../../../../components/ui/tooltip";
import { osiLicenseHexColors } from "../../../../../../../../../utils/view";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../../../../../../components/ui/dropdown-menu";
import { useRouter } from "next/router";
import { Combobox } from "@/components/common/Combobox";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent } from "@/components/ui/dialog";

interface Props {
  components: Paged<ComponentPaged & { license: LicenseResponse }>;
  licenses: LicenseResponse[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
];

const columnHelper = createColumnHelper<
  ComponentPaged & { license: LicenseResponse }
>();

const BadgeWithLicenseDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Badge
      className="capitalize"
      variant={"outline"}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(true);
      }}
    >
      <ChevronDownIcon className={"mr-1 h-4 w-4 text-muted-foreground"} />
      {(row.getValue() as License).licenseId}
      <ChevronDoubleDownIcon />
      <Dialog onOpenChange={setIsOpen} open={isOpen}>
        <DialogContent>
          <Combobox
            onSelect={function (value: string): void {
              throw new Error("Function not implemented.");
            }}
            items={[]}
            placeholder={""}
            emptyMessage={""}
          />
        </DialogContent>
      </Dialog>
    </Badge>
  );
};

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
        <BadgeWithLicenseDialog />
      ) : (
        <Tooltip>
          <TooltipTrigger>
            <Badge
              variant={"outline"}
              onClick={(e) => {
                e.stopPropagation();
                console.log("test");
                <Dialog>
                  <DialogContent>
                    <Combobox
                      onSelect={function (value: string): void {
                        throw new Error("Function not implemented.");
                      }}
                      items={[]}
                      placeholder={""}
                      emptyMessage={""}
                    />
                    ;
                  </DialogContent>
                </Dialog>;
              }}
            >
              <ScaleIcon className={"mr-1 h-4 w-4 text-muted-foreground"} />
              {(row.getValue() as License).licenseId}
              <ChevronDownIcon
                className={"ml-2 h-4 w-4 text-muted-foreground"}
              />
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
    header: "OpenSSF Scorecard",
    id: "Dependency__ComponentProject.score_card_score", // tight coupling with database and SQL-Query
    cell: (row) => (
      <div>{row.getValue() && <OpenSsfScore score={row.getValue()} />}</div>
    ),
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
  const pathname = useRouter().asPath.split("?")[0];

  const [datasets, setDatasets] = useState<{
    purl: string;
    scannerId: string;
    scoreCard?: ScoreCard;
    project: Component["project"];
  }>();

  const { table } = useTable({
    data: components.data,
    columnsDef,
  });

  function dataPassthrough(data: ComponentPaged) {
    setDatasets({
      purl: data.dependency.purl,
      scoreCard: data.dependency.project?.scoreCard,
      project: data.dependency.project,
      scannerId: data.scannerIds.split(" ")[0],
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
      <div className="flex flex-row items-start justify-between">
        <BranchTagSelector branches={branches} tags={tags} />
        <div className="flex flex-row gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"secondary"}>Download SBOM</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Link
                download
                target="_blank"
                prefetch={false}
                href={pathname + `/../sbom.json`}
                className="!text-foreground hover:no-underline"
              >
                <DropdownMenuItem>JSON-Format</DropdownMenuItem>
              </Link>
              <Link
                download
                target="_blank"
                prefetch={false}
                href={pathname + `/../sbom.xml`}
                className="!text-foreground hover:no-underline"
              >
                <DropdownMenuItem>XML-Format</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"secondary"}>Download VeX</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Link
                download
                target="_blank"
                prefetch={false}
                href={pathname + `/../vex.json`}
                className="!text-foreground hover:no-underline"
              >
                <DropdownMenuItem>JSON-Format</DropdownMenuItem>
              </Link>
              <Link
                download
                target="_blank"
                prefetch={false}
                href={pathname + `/../vex.xml`}
                className="!text-foreground hover:no-underline"
              >
                <DropdownMenuItem>XML-Format</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            className={classNames(
              buttonVariants({ variant: "default" }),
              "!text-background",
            )}
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
        </div>
      </div>

      <Section
        primaryHeadline
        forceVertical
        description="Dependencies of the asset"
        title="Dependencies"
        Button={
          <div className="w-1/3">
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
                {licenseToPercentMapEntries
                  .filter((el) => el[1] > 0.5)
                  .map(([el, percent]) => (
                    <span
                      className="whitespace-nowrap text-xs capitalize"
                      key={el.license.licenseId}
                    >
                      <span
                        style={{
                          backgroundColor:
                            osiLicenseHexColors[el.license.licenseId] ??
                            "#eeeeee",
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
        </div>
        <CustomPagination {...components} />
      </Section>

      {datasets && datasets.project && (
        <DependencyDialog
          open={true}
          scannerId={datasets.scannerId}
          project={datasets.project} //undefined will make it go kaboom
          setOpen={() => setDatasets(undefined)} //set dataset as undefined, so that it closes the dataset && condition and stops the
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
