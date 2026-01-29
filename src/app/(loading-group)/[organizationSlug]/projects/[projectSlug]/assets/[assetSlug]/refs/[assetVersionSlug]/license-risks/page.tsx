"use client";
import SortingCaret from "@/components/common/SortingCaret";
import { useAssetMenu } from "@/hooks/useAssetMenu";

import Page from "@/components/Page";
import { LicenseResponse, LicenseRiskDTO, Paged } from "@/types/api/api";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { FunctionComponent, useMemo } from "react";
import { beautifyPurl, classNames, extractVersion } from "@/utils/common";
import { QueryArtifactSelector } from "@/components/ArtifactSelector";
import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import CustomPagination from "@/components/common/CustomPagination";
import EcosystemImage from "@/components/common/EcosystemImage";
import EmptyParty from "@/components/common/EmptyParty";
import Section from "@/components/common/Section";
import LicenseRiskRow from "@/components/risk-handling/LicenseRiskRow";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAssetBranchesAndTags } from "@/hooks/useActiveAssetVersion";
import useTable from "@/hooks/useTable";
import { buildFilterSearchParams } from "@/utils/url";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { useArtifacts } from "../../../../../../../../../../context/AssetVersionContext";
import { fetcher } from "../../../../../../../../../../data-fetcher/fetcher";
import useDebouncedQuerySearch from "../../../../../../../../../../hooks/useDebouncedQuerySearch";
import useDecodedParams from "../../../../../../../../../../hooks/useDecodedParams";
import useRouterQuery from "../../../../../../../../../../hooks/useRouterQuery";
import { Skeleton } from "../../../../../../../../../../components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { osiLicenseHexColors } from "../../../../../../../../../../utils/view";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CaretDownIcon } from "@radix-ui/react-icons";

const columnHelper = createColumnHelper<LicenseRiskDTO>();

const columnsDef: ColumnDef<LicenseRiskDTO, any>[] = [
  {
    ...columnHelper.accessor("componentPurl", {
      header: "Package",
      id: "packageName",
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
  },
  {
    ...columnHelper.accessor("component.license", {
      header: "License",
      enableSorting: false,
      id: "licenseName",
      cell: (row) => <div className="flex flex-row">{row.getValue()}</div>,
    }),
  },
  {
    ...columnHelper.accessor("finalLicenseDecision", {
      header: "Corrected to License",
      enableSorting: false,
      id: "finalLicenseDecision",
      cell: (row) => (
        <div className="flex flex-row">
          {Boolean(row.getValue()) ? row.getValue() : "Not yet corrected"}
        </div>
      ),
    }),
  },
];

const Index: FunctionComponent = () => {
  // fetch the project
  let { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    useDecodedParams() as {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
    };

  const searchParams = useSearchParams();

  const uri =
    "/organizations/" +
    organizationSlug +
    "/projects/" +
    projectSlug +
    "/assets/" +
    assetSlug +
    "/";

  const query = useMemo(() => {
    const p = buildFilterSearchParams(searchParams);
    const state = searchParams?.get("state");
    if (!Boolean(state) || state === "open") {
      p.append("filterQuery[state][is]", "open");
    } else {
      p.append("filterQuery[state][is not]", "open");
    }

    if (searchParams?.has("artifact")) {
      p.append(
        "filterQuery[artifact_license_risks.artifact_artifact_name][is]",
        searchParams.get("artifact") as string,
      );
    }

    return p;
  }, [searchParams]);

  const handleSearch = useDebouncedQuerySearch();

  const { data: vulns, isLoading } = useSWR<Paged<LicenseRiskDTO>>(
    uri +
      "refs/" +
      assetVersionSlug +
      "/" +
      "license-risks?" +
      query.toString(),
    fetcher,
  );

  const { data: licenses, isLoading: licensesLoading } = useSWR<
    LicenseResponse[]
  >(
    uri +
      "refs/" +
      assetVersionSlug +
      "/components/licenses/" +
      (searchParams?.has("artifact")
        ? "?artifact=" +
          encodeURIComponent(searchParams.get("artifact") as string)
        : ""),
    fetcher,
  );

  // Known risky/unknown license identifiers that should be highlighted as warnings
  const riskyLicenses = useMemo(
    () => new Set(["unknown", "noassertion", "unlicensed", ""]),
    [],
  );

  const radarChartData = useMemo(() => {
    if (!licenses || licenses.length === 0) return [];

    // Take top licenses and group small ones as "Other"
    const sorted = [...licenses].sort((a, b) => b.count - a.count);
    const topLicenses = sorted.slice(0, 8);
    const otherCount = sorted
      .slice(8)
      .reduce((acc, curr) => acc + curr.count, 0);

    const data = topLicenses.map((l) => ({
      license: l.license.licenseId || "Unknown",
      count: l.count,
      fill: riskyLicenses.has(l.license.licenseId.toLowerCase())
        ? "hsl(var(--warning))"
        : osiLicenseHexColors[l.license.licenseId.toLowerCase()] ||
          "hsl(var(--primary))",
      isRisky: riskyLicenses.has(l.license.licenseId.toLowerCase()),
    }));

    if (otherCount > 0) {
      data.push({
        license: "Other",
        count: otherCount,
        fill: "hsl(var(--muted-foreground))",
        isRisky: false,
      });
    }

    return data;
  }, [licenses, riskyLicenses]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    radarChartData.forEach((item) => {
      config[item.license] = {
        label: item.license,
        color: item.fill,
      };
    });
    return config;
  }, [radarChartData]);

  const totalLicenses = useMemo(
    () => licenses?.reduce((acc, curr) => acc + curr.count, 0) ?? 0,
    [licenses],
  );

  const unknownCount = useMemo(
    () =>
      licenses
        ?.filter((l) => riskyLicenses.has(l.license.licenseId.toLowerCase()))
        .reduce((acc, curr) => acc + curr.count, 0) ?? 0,
    [licenses, riskyLicenses],
  );

  const { table } = useTable({
    columnsDef,
    data: vulns?.data || [],
  });

  const assetMenu = useAssetMenu();

  const { branches, tags } = useAssetBranchesAndTags();
  const push = useRouterQuery();
  const artifacts = useArtifacts();

  return (
    <Page Menu={assetMenu} title={"Risk Handling"} Title={<AssetTitle />}>
      <div className="flex flex-row items-center justify-between">
        <BranchTagSelector branches={branches} tags={tags} />
      </div>

      <Section
        forceVertical
        primaryHeadline
        title="Identified License Risks"
        description="This table shows all the identified license risks for this repository."
        className="mb-4 mt-4"
      >
        <Card className="px-4">
          {/* License Distribution Radar Chart */}
          <Collapsible className="my-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">License Distribution</h3>
              </div>
              <CollapsibleTrigger className="p-2 hover:bg-muted rounded-md transition-colors">
                <CaretDownIcon className="h-5 w-5 text-muted-foreground transition-transform duration-200 [[data-state=closed]_&]:rotate-[-90deg]" />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-background">
                  <CardHeader className="items-start pb-4">
                    <CardTitle>Overview</CardTitle>
                    <CardDescription>
                      Distribution of {totalLicenses} dependencies by license
                      type
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-0">
                    {licensesLoading ? (
                      <div className="flex items-center justify-center h-[250px]">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : radarChartData.length > 0 ? (
                      <ChartContainer
                        config={chartConfig}
                        className="mx-auto max-h-[250px]"
                      >
                        <RadarChart data={radarChartData}>
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                          />
                          <PolarAngleAxis dataKey="license" />
                          <PolarGrid />
                          <Radar
                            dataKey="count"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.6}
                            dot={{
                              r: 4,
                              fillOpacity: 1,
                            }}
                          />
                        </RadarChart>
                      </ChartContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                        No license data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-background">
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                    <CardDescription>
                      Quick overview of your license compliance status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {licensesLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            Total Dependencies
                          </span>
                          <span className="text-sm font-semibold">
                            <Badge variant="outline">{totalLicenses}</Badge>
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            Unique Licenses
                          </span>
                          <span className="text-sm font-semibold">
                            <Badge variant="outline">
                              {licenses?.length ?? 0}
                            </Badge>
                          </span>
                        </div>
                        {unknownCount > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              Unknown/Unasserted Licenses
                            </span>
                            <span className="text-sm font-semibold">
                              <Badge variant="yellow">{unknownCount}</Badge>
                            </span>
                          </div>
                        )}
                        <div className="mt-6">
                          <span className="text-xs text-muted-foreground mb-3 block">
                            Top Licenses
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {radarChartData.slice(0, 10).map((item) => (
                              <Badge
                                key={item.license}
                                variant={item.isRisky ? "yellow" : "outline"}
                              >
                                {item.license}: {item.count}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
        <div className="relative flex flex-row gap-2">
          <QueryArtifactSelector
            unassignPossible
            artifacts={artifacts.map((a) => a.artifactName)}
          />
          <Tabs
            defaultValue={
              searchParams?.has("state")
                ? (searchParams.get("state") as string)
                : "open"
            }
            value={searchParams?.get("state") ?? "open"}
          >
            <TabsList>
              <TabsTrigger
                onClick={() =>
                  push({
                    state: "open",
                  })
                }
                value="open"
              >
                Open
              </TabsTrigger>
              <TabsTrigger
                onClick={() =>
                  push({
                    state: "closed",
                  })
                }
                value="closed"
              >
                Closed
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Input
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams?.get("search") as string}
            placeholder="Search for cve, package name, message or scanner..."
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 ">
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
      </Section>
      {!vulns?.data.length ? (
        <div>
          <EmptyParty
            title="No matching results."
            description="Risk identification is the process of determining what risks exist in the asset and what their characteristics are. This process is done by identifying, assessing, and prioritizing risks."
          />
          <div className="mt-4">{vulns && <CustomPagination {...vulns} />}</div>
        </div>
      ) : (
        <div>
          <div className="overflow-hidden rounded-lg border shadow-sm">
            <div className="overflow-auto">
              <table className="w-full table-fixed overflow-x-auto text-sm">
                <thead className="border-b bg-card text-foreground">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          className="w-40 cursor-pointer break-normal p-4 text-left"
                          onClick={
                            header.column.columnDef.enableSorting
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                          key={header.id}
                        >
                          <div className="flex flex-row items-center gap-2">
                            <div>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                            </div>
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
                          <Skeleton className="w-full h-[20px]" />
                        </td>
                        <td className="p-4">
                          <Skeleton className="w-1/2 h-[20px]" />
                        </td>
                      </tr>
                    ))}
                  {table.getRowModel().rows.map((row, i, arr) => (
                    <LicenseRiskRow
                      key={row.original.id}
                      risk={row.original}
                      index={i}
                      arrLength={arr.length}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4">{vulns && <CustomPagination {...vulns} />}</div>
        </div>
      )}
    </Page>
  );
};

export default Index;
