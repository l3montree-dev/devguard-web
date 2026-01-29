"use client";

import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { browserApiClient } from "@/services/devGuardApi";
import "@xyflow/react/dist/style.css";
import { FunctionComponent, useMemo, useState } from "react";
import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import CustomPagination from "@/components/common/CustomPagination";
import EcosystemImage from "@/components/common/EcosystemImage";
import Section from "@/components/common/Section";
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
import {
  beautifyPurl,
  classNames,
  extractVersion,
  licenses,
} from "@/utils/common";
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
import { ChevronDownIcon, GitBranch, Loader2 } from "lucide-react";
import Link from "next/link";
import DateString, {
  parseDateOnly,
} from "../../../../../../../../../../components/common/DateString";
import SortingCaret from "../../../../../../../../../../components/common/SortingCaret";
import { Badge } from "../../../../../../../../../../components/ui/badge";
import {
  AsyncButton,
  Button,
  buttonVariants,
} from "../../../../../../../../../../components/ui/button";
import { useActiveAsset } from "../../../../../../../../../../hooks/useActiveAsset";
import { useActiveProject } from "../../../../../../../../../../hooks/useActiveProject";
import Page from "@/components/Page";
import { Combobox } from "@/components/common/Combobox";
import { useRouter } from "next/navigation";
import DependencyDialog from "../../../../../../../../../../components/DependencyDialog";
import OpenSsfScore from "../../../../../../../../../../components/common/OpenSsfScore";
import { QueryArtifactSelector } from "@/components/ArtifactSelector";
import SbomDownloadModal from "@/components/dependencies/SbomDownloadModal";
import VexDownloadModal from "@/components/dependencies/VexDownloadModal";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GitBranchIcon, Loader2Icon } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import useSWR from "swr";
import { useArtifacts } from "../../../../../../../../../../context/AssetVersionContext";
import { fetcher } from "../../../../../../../../../../data-fetcher/fetcher";
import useDecodedParams from "../../../../../../../../../../hooks/useDecodedParams";
import { Skeleton } from "../../../../../../../../../../components/ui/skeleton";
import useDebouncedQuerySearch from "@/hooks/useDebouncedQuerySearch";

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
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    useDecodedParams() as {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
    };
  const [license, setLicense] = useState(props.license.licenseId);

  const handleManuallyOverwriteLicenseChange = async (license: string) => {
    // delete the overwritten license
    const resp = await browserApiClient(
      "/organizations/" +
        organizationSlug +
        "/projects/" +
        projectSlug +
        "/assets/" +
        assetSlug +
        "/refs/" +
        assetVersionSlug +
        "/license-risks/",
      {
        method: "POST",
        body: JSON.stringify({
          finalLicenseDecision: license,
          componentPurl: props.dependencyPurl,
        }),
      },
    );
    if (!resp.ok) {
      toast.error("Failed to correct license");
    } else {
      setLicense(license);
      toast.success("Successfully corrected the license to " + license);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Badge
          className="whitespace-nowrap cursor-pointer"
          variant={"outline"}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          {props.license.licenseId === "loading" ? (
            <Loader2Icon className="h-4 w-4 mr-1 animate-spin text-muted-foreground" />
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
              {props.license.isOsiApproved && (
                <CheckBadgeIcon className="mr-1 inline-block h-4 w-4 text-green-500" />
              )}
              {licenseMap[license] || license}
            </span>

            <span className="text-sm text-muted-foreground">
              {props.license.isOsiApproved
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
            </div>

            <div className="mt-2">
              <Combobox
                items={licenses}
                placeholder={getLicenseName(
                  props.component.license,
                  props.license.licenseId,
                )}
                emptyMessage={""}
                onSelect={(selectedLicense) =>
                  handleManuallyOverwriteLicenseChange(selectedLicense)
                }
              />
            </div>
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
      <span className="flex flex-row items-center gap-2">
        <EcosystemImage packageName={row.getValue()} size={16} />
        <span className="font-medium truncate">
          {beautifyPurl(row.getValue())}
        </span>
        <span className="text-xs text-muted-foreground">
          {extractVersion(row.getValue())}
        </span>
      </span>
    ),
  }),
  columnHelper.accessor("license", {
    header: "License",
    id: "Dependency.license",
    enableSorting: false,
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
    id: "dependency_project.project_key",
    cell: (row) =>
      row.row.original.dependency?.project && (
        <div>
          <div className="mb-2">
            <a
              href={`//${row.getValue()}`}
              target="_blank"
              className="block truncate"
            >
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
    id: "dependency_project.score_card_score", // tight coupling with database and SQL-Query
    cell: (row) => (
      <div>{row.getValue() && <OpenSsfScore score={row.getValue()} />}</div>
    ),
  }),
  columnHelper.accessor("dependency.published", {
    header: "Published",
    id: "dependency.published",
    cell: (row) =>
      row.getValue() && (
        <div className="flex flex-row items-center gap-2">
          <CalendarDateRangeIcon className="w-4 text-muted-foreground" />
          <DateString date={parseDateOnly(row.getValue())} />
        </div>
      ),
  }),
];

const Index: FunctionComponent = () => {
  const assetMenu = useAssetMenu();

  const [showSBOMModal, setShowSBOMModal] = useState(false);
  const [showVexModal, setShowVexModal] = useState(false);

  const { branches, tags } = useAssetBranchesAndTags();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [datasets, setDatasets] = useState<{
    purl: string;
    scoreCard?: ScoreCard;
    project: Component["project"];
  }>();

  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    useDecodedParams() as {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
    };

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

  const params = useMemo(() => {
    const params = buildFilterSearchParams(searchParams);
    if (searchParams?.has("artifact")) {
      params.append(
        "artifactName",
        encodeURIComponent(searchParams.get("artifact") as string),
      );
    }
    return params;
  }, [searchParams]);

  const handleSearch = useDebouncedQuerySearch();

  const { data: components, isLoading } = useSWR<Paged<ComponentPaged>>(
    url + "?" + params.toString(),
    fetcher,
    {
      fallbackData: {
        data: [],
        page: 1,
        pageSize: 20,
        total: 0,
      },
    },
  );
  const { data: licenses } = useSWR<LicenseResponse[]>(
    url +
      "/licenses" +
      (searchParams?.has("artifact")
        ? "?artifact=" +
          encodeURIComponent(searchParams.get("artifact") as string)
        : ""),
    fetcher,
  );

  const artifacts = useArtifacts();

  const licenseMap = useMemo(
    () =>
      (licenses || []).reduce(
        (acc, curr) => ({
          ...acc,
          [curr.license.licenseId.toLowerCase()]: curr.license,
        }),
        {} as Record<string, License>,
      ),
    [licenses],
  );

  components!.data = useMemo(
    () =>
      components!.data.map((component) => ({
        ...component,
        license: licenseMap[
          (component.dependency.license ?? "").toLowerCase()
        ] ?? {
          licenseId: "loading",
          name: "Loading",
          count: 0,
        },
      })),
    [components, licenseMap],
  );

  const router = useRouter();

  const { table } = useTable({
    data: (components?.data ?? []) as Array<
      ComponentPaged & {
        license: LicenseResponse;
      }
    >,
    columnsDef,
  });

  function dataPassthrough(data: ComponentPaged) {
    setDatasets({
      purl: data.dependency.purl,
      scoreCard: data.dependency.project?.scoreCard,
      project: data.dependency.project,
    });
  }

  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();
  const assetVersion = useActiveAssetVersion();

  const handleLicenseRefresh = async () => {
    const resp = await browserApiClient(
      `/organizations/${activeOrg.slug}/projects/${project?.slug}/assets/${asset?.slug}/refs/${assetVersion?.slug}/components/licenses/refresh`,
      {
        method: "POST",
      },
    );
    if (resp.ok) {
      toast.success("License refresh triggered");
      router.refresh();
    } else {
      toast.error("Failed to trigger license refresh");
    }
  };

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
          <Button variant={"secondary"} onClick={() => setShowVexModal(true)}>
            Download VeX
          </Button>

          <Link
            className={classNames(
              buttonVariants({ variant: "default" }),
              "!text-primary-foreground",
            )}
            href={
              `/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}/refs/${assetVersion?.slug}/dependencies/graph?` +
              new URLSearchParams(
                searchParams?.has("artifact")
                  ? {
                      artifact: searchParams.get("artifact") as string,
                    }
                  : artifacts && artifacts.length > 0
                    ? {
                        artifact: artifacts[0].artifactName,
                      }
                    : ({} as Record<string, string>),
              )
            }
          >
            <GitBranchIcon className="mr-2 h-4 w-4" />
            Open Dependency Graph
          </Link>
        </div>
      </div>

      <Section
        primaryHeadline
        forceVertical
        description="All your Dependencies of the selected artifact on the selected reference (branch/tag)."
        title="All Dependencies"
      >
        <div className="flex flex-row items-center justify-between gap-2">
          <QueryArtifactSelector
            unassignPossible
            artifacts={(artifacts ?? []).map((a) => a.artifactName)}
          />
          <div className="relative flex-1">
            <Input
              onChange={(e) => handleSearch(e.target.value)}
              defaultValue={searchParams?.get("search") as string}
              placeholder="Search for dependencies or versions - just start typing..."
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 ">
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border shadow-sm">
          <table className="w-full table-fixed overflow-x-auto text-sm">
            <thead className="border-b bg-card text-foreground">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
                    <th
                      className={classNames(
                        "cursor-pointer break-normal p-4 text-left",
                        index === 0 && "w-[350px]",
                        index === 2 && "w-[300px]",
                      )}
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
              {isLoading &&
                Array.from(Array(10).keys()).map((el, i, arr) => (
                  <tr
                    className={classNames(
                      "relative cursor-pointer align-top transition-all",
                      i === arr.length - 1 ? "" : "border-b",
                      i % 2 !== 0 && "bg-card/50",
                    )}
                    key={el}
                  >
                    <td className="p-4">
                      <Skeleton className="w-2/3 h-[20px]" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="w-1/2 h-[20px]" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="w-full h-[40px]" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="w-1/2 h-[20px]" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="w-1/2 h-[20px]" />
                    </td>
                  </tr>
                ))}
              {table.getRowModel().rows.map((row, index, arr) => (
                <tr
                  onClick={() => dataPassthrough(row.original)}
                  className={classNames(
                    "relative bg-background align-top transition-all",
                    index === arr.length - 1 ? "" : "border-b",
                    index % 2 != 0 && "bg-card/50",
                    row.original.dependency.projectId && "cursor-pointer",
                    "hover:bg-gray-50 dark:hover:bg-card",
                  )}
                  key={row.original.id}
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
        {components && <CustomPagination {...components} />}
        <div className="flex flex-row justify-end">
          <AsyncButton onClick={handleLicenseRefresh} variant={"ghost"}>
            Refresh Licenses
          </AsyncButton>
        </div>
      </Section>

      {datasets && datasets.project && (
        <DependencyDialog
          open={true}
          project={datasets.project} //undefined will make it go kaboom
          setOpen={() => setDatasets(undefined)} //set dataset as undefined, so that it closes the dataset && condition and stops the
          purl={datasets.purl}
          scoreCard={datasets.scoreCard}
        />
      )}
      <SbomDownloadModal
        artifacts={artifacts}
        showSBOMModal={showSBOMModal}
        setShowSBOMModal={setShowSBOMModal}
        pathname={pathname || ""}
        assetName={asset?.name}
        assetVersionName={assetVersion?.name}
      />
      <VexDownloadModal
        artifacts={artifacts}
        showVexModal={showVexModal}
        setShowVexModal={setShowVexModal}
        pathname={pathname || ""}
        assetName={asset?.name}
        assetVersionName={assetVersion?.name}
      />
    </Page>
  );
};
export default Index;
