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
  ArtifactDTO,
  Component,
  ComponentPaged,
  License,
  LicenseResponse,
  Paged,
  ScoreCard,
} from "@/types/api/api";
import { beautifyPurl, classNames, licenses } from "@/utils/common";
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
import { ChevronDownIcon, GitBranch } from "lucide-react";
import Link from "next/link";
import DateString from "../../../../../../../../../components/common/DateString";
import SortingCaret from "../../../../../../../../../components/common/SortingCaret";
import { Badge } from "../../../../../../../../../components/ui/badge";
import {
  AsyncButton,
  Button,
  buttonVariants,
} from "../../../../../../../../../components/ui/button";
import { useActiveAsset } from "../../../../../../../../../hooks/useActiveAsset";
import { useActiveProject } from "../../../../../../../../../hooks/useActiveProject";

import Page from "@/components/Page";
import { Combobox } from "@/components/common/Combobox";
import { useRouter } from "next/compat/router";
import DependencyDialog from "../../../../../../../../../components/DependencyDialog";
import OpenSsfScore from "../../../../../../../../../components/common/OpenSsfScore";

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
import { toast } from "sonner";
import { osiLicenseHexColors } from "../../../../../../../../../utils/view";
import { withArtifacts } from "../../../../../../../../../decorators/withArtifacts";

interface Props {
  components: Paged<ComponentPaged & { license: LicenseResponse }>;
  licenses: LicenseResponse[];
  artifacts: ArtifactDTO[];
}

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
    useRouter().query;
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
      <span className="flex flex-row items-start gap-2">
        <EcosystemImage packageName={row.getValue()} />
        {beautifyPurl(row.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("dependency.version", {
    header: "Version",
    id: "dependency.version",
    cell: (row) =>
      row.getValue() && <Badge variant={"secondary"}>{row.getValue()}</Badge>,
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
          <DateString date={new Date(row.getValue())} />
        </div>
      ),
  }),
];

const Index: FunctionComponent<Props> = ({
  components,
  licenses,
  artifacts,
}) => {
  const assetMenu = useAssetMenu();

  const [showSBOMModal, setShowSBOMModal] = useState(false);
  const [showVexModal, setShowVexModal] = useState(false);

  const { branches, tags } = useAssetBranchesAndTags();
  const pathname = useRouter().asPath.split("?")[0];

  const [datasets, setDatasets] = useState<{
    purl: string;
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

  const handleLicenseRefresh = async () => {
    const resp = await browserApiClient(
      `/organizations/${activeOrg.slug}/projects/${project.slug}/assets/${asset?.slug}/refs/${assetVersion?.slug}/components/licenses/refresh`,
      {
        method: "POST",
      },
    );
    if (resp.ok) {
      toast.success("License refresh triggered");
      router.reload();
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
              "!text-black",
            )}
            href={
              `/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}/refs/${assetVersion?.slug}/dependencies/graph?` +
              new URLSearchParams(
                router.query.artifact && {
                  artifact: router.query.artifact as string,
                },
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
        <div className="flex flex-row items-center justify-between gap-2">
          <QueryArtifactSelector
            unassignPossible
            artifacts={(artifacts ?? []).map((a) => a.artifactName)}
          />
          <Input
            onChange={handleSearch}
            defaultValue={router.query.search as string}
            placeholder="Search for dependencies or versions - just start typing..."
          />
        </div>
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
        <CustomPagination {...components} />
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
        pathname={pathname}
        assetName={asset?.name}
        assetVersionName={assetVersion?.name}
      />
      <VexDownloadModal
        artifacts={artifacts}
        showVexModal={showVexModal}
        setShowVexModal={setShowVexModal}
        pathname={pathname}
        assetName={asset?.name}
        assetVersionName={assetVersion?.name}
      />
    </Page>
  );
};
export default Index;

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext, { artifacts }) => {
    if (artifacts.length === 0) {
      return {
        notFound: true,
      };
    }
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

    const params = buildFilterSearchParams(context);

    const artifact = context.query.artifact as string;
    if (artifact) {
      params.append(
        "filterQuery[artifact_component_dependencies.artifact_artifact_name][is]",
        artifact as string,
      );
    }

    const [components, licenses, artifactsData] = await Promise.all([
      apiClient(url + "?" + params.toString()).then((r) => r.json()) as Promise<
        Paged<ComponentPaged>
      >,
      apiClient(
        url +
          "/licenses" +
          (artifact ? "?artifact=" + encodeURIComponent(artifact) : ""),
      ).then((r) => r.json() as Promise<LicenseResponse[]>),
      apiClient(
        "/organizations/" +
          organizationSlug +
          "/projects/" +
          projectSlug +
          "/assets/" +
          assetSlug +
          "/refs/" +
          assetVersionSlug +
          "/artifacts/",
      ).then((r) => (!r.ok ? [] : (r.json() as Promise<ArtifactDTO[]>))),
    ]);

    const licenseMap = licenses.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.license.licenseId.toLowerCase()]: curr.license,
      }),
      {} as Record<string, License>,
    );

    components.data = components.data.map((component) => ({
      ...component,
      license: licenseMap[
        (component.dependency.license ?? "").toLowerCase()
      ] ?? {
        licenseId: "loading",
        name: "Loading",
        count: 0,
      },
    }));

    return {
      props: {
        components,
        licenses,
        artifacts: artifactsData,
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
    artifacts: withArtifacts,
  },
);
