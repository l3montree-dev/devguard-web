import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrganization } from "@/decorators/withOrganization";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import {
  browserApiClient,
  getApiClientFromContext,
} from "@/services/devGuardApi";
import "@xyflow/react/dist/style.css";
import { GetServerSidePropsContext } from "next";

import { FunctionComponent, SetStateAction, useMemo, useState } from "react";

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
  ScaleIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import {
  BadgeInfo,
  ChevronDownIcon,
  FileCode,
  FileTextIcon,
  GitBranch,
  PersonStandingIcon,
} from "lucide-react";
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
import { Combobox } from "@/components/common/Combobox";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { useRouter } from "next/router";
import DependencyDialog from "../../../../../../../../../components/DependencyDialog";
import OpenSsfScore from "../../../../../../../../../components/common/OpenSsfScore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../../../../../../components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
} from "../../../../../../../../../components/ui/tooltip";
import { osiLicenseHexColors } from "../../../../../../../../../utils/view";

import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Switch } from "../../../../../../../../../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GitBranchIcon } from "lucide-react";
import Image from "next/image";
import { Loader2Icon } from "lucide-react";
import { DelayedDownloadButton } from "@/components/common/DelayedDownloadButton";
import SbomDownloadModal from "@/components/dependencies/SbomDownloadModal";

interface Props {
  components: Paged<ComponentPaged & { license: LicenseResponse }>;
  licenses: LicenseResponse[];
}

const licenses = [
  { value: "bsd-1-clause", label: "BSD-1-Clause" },
  { value: "afl-3.0", label: "AFL-3.0" },
  { value: "apl-1.0", label: "APL-1.0" },
  { value: "apache-1.1", label: "Apache-1.1" },
  { value: "apsl-2.0", label: "APSL-2.0" },
  { value: "artistic-1.0-perl", label: "Artistic-1.0-Perl" },
  { value: "artistic-1.0", label: "Artistic-1.0" },
  { value: "artistic-2.0", label: "Artistic-2.0" },
  { value: "aal", label: "AAL" },
  { value: "blueoak-1.0.0", label: "BlueOak-1.0.0" },
  { value: "bsl-1.0", label: "BSL-1.0" },
  { value: "bsd-2-clause-patent", label: "BSD-2-Clause-Patent" },
  { value: "cecill-2.1", label: "CECILL-2.1" },
  { value: "cern-ohl-p-2.0", label: "CERN-OHL-P-2.0" },
  { value: "cern-ohl-s-2.0", label: "CERN-OHL-S-2.0" },
  { value: "cern-ohl-w-2.0", label: "CERN-OHL-W-2.0" },
  { value: "mit-cmu", label: "MIT-CMU" },
  { value: "cddl-1.0", label: "CDDL-1.0" },
  { value: "cpal-1.0", label: "CPAL-1.0" },
  { value: "cpl-1.0", label: "CPL-1.0" },
  { value: "catosl-1.1", label: "CATOSL-1.1" },
  { value: "cal-1.0", label: "CAL-1.0" },
  { value: "cua-opl-1.0", label: "CUA-OPL-1.0" },
  { value: "epl-1.0", label: "EPL-1.0" },
  { value: "epl-2.0", label: "EPL-2.0" },
  { value: "ecos-2.0", label: "eCos-2.0" },
  { value: "ecl-1.0", label: "ECL-1.0" },
  { value: "ecl-2.0", label: "ECL-2.0" },
  { value: "efl-1.0", label: "EFL-1.0" },
  { value: "efl-2.0", label: "EFL-2.0" },
  { value: "entessa", label: "Entessa" },
  { value: "eudatagrid", label: "EUDatagrid" },
  { value: "eupl-1.2", label: "EUPL-1.2" },
  { value: "fair", label: "Fair" },
  { value: "frameworx-1.0", label: "Frameworx-1.0" },
  { value: "agpl-3.0-only", label: "AGPL-3.0-only" },
  { value: "gpl-2.0", label: "GPL-2.0" },
  { value: "gpl-3.0-only", label: "GPL-3.0-only" },
  { value: "lgpl-2.1", label: "LGPL-2.1" },
  { value: "lgpl-3.0-only", label: "LGPL-3.0-only" },
  { value: "lgpl-2.0-only", label: "LGPL-2.0-only" },
  { value: "hpnd", label: "HPND" },
  { value: "ipl-1.0", label: "IPL-1.0" },
  { value: "icu", label: "ICU" },
  { value: "intel", label: "Intel" },
  { value: "ipa", label: "IPA" },
  { value: "isc", label: "ISC" },
  { value: "jam", label: "Jam" },
  { value: "lppl-1.3c", label: "LPPL-1.3c" },
  { value: "bsd-3-clause-lbnl", label: "BSD-3-Clause-LBNL" },
  { value: "liliq-p-1.1", label: "LiLiQ-P-1.1" },
  { value: "liliq-rplus-1.1", label: "LiLiQ-Rplus-1.1" },
  { value: "liliq-r-1.1", label: "LiLiQ-R-1.1" },
  { value: "lpl-1.02", label: "LPL-1.02" },
  { value: "lpl-1.0", label: "LPL-1.0" },
  { value: "ms-pl", label: "MS-PL" },
  { value: "ms-rl", label: "MS-RL" },
  { value: "miros", label: "MirOS" },
  { value: "mit-0", label: "MIT-0" },
  { value: "mit", label: "MIT" },
  { value: "motosoto", label: "Motosoto" },
  { value: "mpl-1.1", label: "MPL-1.1" },
  { value: "mpl-2.0", label: "MPL-2.0" },
  { value: "mpl-1.0", label: "MPL-1.0" },
  { value: "mulanpsl-2.0", label: "MulanPSL-2.0" },
  { value: "multics", label: "Multics" },
  { value: "nasa-1.3", label: "NASA-1.3" },
  { value: "naumen", label: "Naumen" },
  { value: "nokia", label: "NOKIA" },
  { value: "nposl-3.0", label: "NPOSL-3.0" },
  { value: "ntp", label: "NTP" },
  { value: "ogtsl", label: "OGTSL" },
  { value: "olfl-1.3", label: "OLFL-1.3" },
  { value: "osl-2.1", label: "OSL-2.1" },
  { value: "osl-1.0", label: "OSL-1.0" },
  { value: "oldap-2.8", label: "OLDAP-2.8" },
  { value: "oset-pl-2.1", label: "OSET-PL-2.1" },
  { value: "php-3.0", label: "PHP-3.0" },
  { value: "php-3.01", label: "PHP-3.01" },
  { value: "psf-2.0", label: "PSF-2.0" },
  { value: "rpsl-1.0", label: "RPSL-1.0" },
  { value: "rpl-1.5", label: "RPL-1.5" },
  { value: "rpl-1.1", label: "RPL-1.1" },
  { value: "ofl-1.1", label: "OFL-1.1" },
  { value: "simpl-2.0", label: "SimPL-2.0" },
  { value: "sissl", label: "SISSL" },
  { value: "spl-1.0", label: "SPL-1.0" },
  { value: "bsd-3-clause", label: "BSD-3-Clause" },
  { value: "cnri-python", label: "CNRI-Python" },
  { value: "eupl-1.1", label: "EUPL-1.1" },
  { value: "ngpl", label: "NGPL" },
  { value: "osl-3.0", label: "OSL-3.0" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "qpl-1.0", label: "QPL-1.0" },
  { value: "rscpl", label: "RSCPL" },
  { value: "sleepycat", label: "Sleepycat" },
  { value: "watcom-1.0", label: "Watcom-1.0" },
  { value: "upl-1.0", label: "UPL-1.0" },
  { value: "ncsa", label: "NCSA" },
  { value: "unlicense", label: "Unlicense" },
  { value: "vsl-0.1", label: "VSL-0.1" },
  { value: "w3c-20150513", label: "W3C-20150513" },
  { value: "wxwindows", label: "wxWindows" },
  { value: "xnet", label: "Xnet" },
  { value: "zlib", label: "Zlib" },
  { value: "unicode-dfs-2015", label: "Unicode-DFS-2015" },
  { value: "ucl-1.0", label: "UCL-1.0" },
  { value: "zpl-2.0", label: "ZPL-2.0" },
  { value: "zpl-2.1", label: "ZPL-2.1" },
];

const licenseMap = licenses.reduce(
  (acc, { value, label }) => {
    acc[value] = label;
    return acc;
  },
  {} as Record<string, string>,
);

const getLicenseName = (
  componentOverwrittenLicense: string | undefined,
  license: string,
) => {
  if (componentOverwrittenLicense) {
    return (
      licenseMap[componentOverwrittenLicense] || componentOverwrittenLicense
    );
  }
  return licenseMap[license] || license;
};

const LicenseCall = (props: {
  license: License;
  component: Component;
  dependencyPurl: string;
  justification: string;
}) => {
  const [open, setOpen] = useState(false);
  const activeOrg = useActiveOrg();
  const [license, setLicense] = useState(
    props.component.license ?? props.license.licenseId,
  );
  const [manuallyCorrectLicense, setManuallyCorrectLicense] = useState(
    Boolean(props.component.isLicenseOverwritten),
  );

  const handleLicenseUpdate = async (
    newlicense: string,
    organizationId: string,
    purl: string,
    justification: string,
  ) => {
    const resp = await browserApiClient(
      "/organizations/" + activeOrg.slug + "/license-overwrite/",
      {
        method: "PUT",
        body: JSON.stringify({
          licenseId: newlicense,
          organizationId: organizationId,
          componentPurl: purl,
          justification: "",
        }),
      },
    );
    if (!resp.ok) {
      toast.error("Failed to change License");
      return;
    }
    setLicense(newlicense);
  };

  const handleManuallyOverwriteLicenseChange = async (checked: boolean) => {
    setManuallyCorrectLicense(checked);
    if (!checked) {
      // delete the overwritten license
      const resp = await browserApiClient(
        "/organizations/" +
          activeOrg.slug +
          "/license-overwrite/" +
          encodeURIComponent(props.dependencyPurl),
        {
          method: "DELETE",
        },
      );
      if (!resp.ok) {
        toast.error("Failed to delete overwritten license");
      } else {
        toast.success("Successfully deleted overwritten license");
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Badge
          variant={"outline"}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          {props.license.licenseId === "loading" ? (
            <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <ScaleIcon className={"mr-1 h-4 w-4 text-muted-foreground"} />
          )}

          {licenseMap[license] || license}
          <ChevronDownIcon className={"ml-2 h-4 w-4 text-muted-foreground"} />
        </Badge>
      </PopoverTrigger>
      <div onClick={(e) => e.stopPropagation()}>
        <PopoverContent className="w-96">
          <div className="flex flex-col items-start justify-start gap-1">
            <span className="flex flex-row capitalize items-center text-sm font-bold">
              {(props.license.isOsiApproved || manuallyCorrectLicense) && (
                <CheckBadgeIcon className="mr-1 inline-block h-4 w-4 text-green-500" />
              )}
              {licenseMap[license] || license}
            </span>
            {manuallyCorrectLicense && (
              <span className="flex absolute top-0 right-0 m-2 ">
                <Tooltip>
                  <TooltipTrigger>
                    <BadgeInfo className="flex w-5 h-5 absolute top-0 right-0 text-green-500"></BadgeInfo>
                  </TooltipTrigger>
                  <TooltipContent>
                    This license was manually overwritten by a user.
                  </TooltipContent>
                </Tooltip>
              </span>
            )}
            <span className="text-sm text-muted-foreground">
              {props.license.isOsiApproved || manuallyCorrectLicense
                ? "OSI Approved, "
                : "Not OSI Approved, "}
              <a
                href={`https://opensource.org/licenses/${props.license.licenseId}`}
                target="_blank"
                className="text-sm font-semibold !text-muted-foreground underline"
              >
                Open Source License
              </a>
            </span>
          </div>

          <div className="mt-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-row items-center justify-between">
              <span className="text-sm mb-2 block text-muted-foreground">
                Manually correct the license
              </span>
              <Switch
                onCheckedChange={handleManuallyOverwriteLicenseChange}
                checked={manuallyCorrectLicense}
              />
            </div>
            {manuallyCorrectLicense && (
              <div className="mt-2">
                <Combobox
                  items={licenses}
                  placeholder={getLicenseName(
                    props.component.license,
                    props.license.licenseId,
                  )}
                  emptyMessage={""}
                  onSelect={(selectedLicense) =>
                    handleLicenseUpdate(
                      selectedLicense,
                      activeOrg.id,
                      props.dependencyPurl,
                      "justification",
                    )
                  }
                />
              </div>
            )}
          </div>
        </PopoverContent>
      </div>
    </Popover>
  );
};

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
    cell: (row) => (
      <LicenseCall
        dependencyPurl={row.row.original.dependencyPurl}
        component={row.row.original.dependency}
        license={row.getValue()}
        justification={""}
      />
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

  const [showSBOMModal, setShowSBOMModal] = useState(false);

  const { branches, tags } = useAssetBranchesAndTags();
  const pathname = useRouter().asPath.split("?")[0];

  const [datasets, setDatasets] = useState<{
    purl: string;
    scannerId: string;
    scoreCard?: ScoreCard;
    project: Component["project"];
  }>();

  const router = useRouter();
  const { table, isLoading, handleSearch } = useTable({
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
          <Button variant={"secondary"} onClick={() => setShowSBOMModal(true)}>
            Download SBOM
          </Button>
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
        <Input
          onChange={handleSearch}
          defaultValue={router.query.search as string}
          placeholder="Search for dependencies or versions - just start typing..."
        />
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
      <SbomDownloadModal
        showSBOMModal={showSBOMModal}
        setShowSBOMModal={setShowSBOMModal}
        pathname={pathname}
        assetName={asset?.name}
        assetVersionName={assetVersion?.name}
      />
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
        licenseId: "loading",
        name: "Loading",
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
