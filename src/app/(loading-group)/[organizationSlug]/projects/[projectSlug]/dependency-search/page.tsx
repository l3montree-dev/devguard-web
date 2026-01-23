"use client";

import Section from "@/components/common/Section";
import SortingCaret from "@/components/common/SortingCaret";
import Page from "@/components/Page";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import useDebouncedQuerySearch from "@/hooks/useDebouncedQuerySearch";
import useTable from "@/hooks/useTable";
import { Paged, ProjectDependency } from "@/types/api/api";
import { beautifyPurl, classNames, extractVersion } from "@/utils/common";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/dist/client/components/navigation";
import { FunctionComponent, useMemo } from "react";
import useSWR from "swr";
import EmptyParty from "../../../../../../components/common/EmptyParty";
import { fetcher } from "../../../../../../data-fetcher/fetcher";
import useDecodedParams from "../../../../../../hooks/useDecodedParams";
import { useOrganizationMenu } from "../../../../../../hooks/useOrganizationMenu";

import ArtifactBadge from "@/components/ArtifactBadge";
import CustomPagination from "@/components/common/CustomPagination";
import EcosystemImage from "@/components/common/EcosystemImage";
import { Badge } from "@/components/ui/badge";
import { buildFilterSearchParams } from "@/utils/url";
import { useActiveProject } from "../../../../../../hooks/useActiveProject";

const OrgDependencySearch: FunctionComponent = () => {
  const menu = useOrganizationMenu();
  const { organizationSlug } = useDecodedParams() as {
    organizationSlug: string;
  };
  const project = useActiveProject();
  const url =
    "/organizations/" +
    organizationSlug +
    "/projects/" +
    project?.slug +
    "/components";
  const handleSearch = useDebouncedQuerySearch();

  const searchParams = useSearchParams();

  const params = useMemo(() => {
    const params = buildFilterSearchParams(searchParams);

    return params;
  }, [searchParams]);

  const columnHelper = createColumnHelper<ProjectDependency>();

  const columnsDef: ColumnDef<ProjectDependency, any>[] = [
    columnHelper.accessor("dependencyPurl", {
      header: "Package",
      id: "dependencyPurl",
      enableSorting: false,
      cell: (row) => (
        <span className="flex flex-row gap-2">
          <div className="flex h-5 w-5 flex-row items-center justify-center">
            <EcosystemImage packageName={row.getValue()} />
          </div>
          <div className="flex-1">{beautifyPurl(row.getValue())}</div>
        </span>
      ),
    }),

    columnHelper.accessor("dependencyPurl", {
      header: "Version",
      id: "dependencyPurl",
      enableSorting: false,
      cell: (row) => (
        <span className="flex flex-row items-start gap-2">
          <Badge variant={"secondary"}> {extractVersion(row.getValue())}</Badge>
        </span>
      ),
    }),
    columnHelper.accessor("projectName", {
      header: "Project",
      id: "projectName",
      enableSorting: false,
      cell: (row) => (
        <span className="flex flex-row items-start gap-2">
          {row.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("assetName", {
      header: "Repository",
      id: "assetName",
      enableSorting: false,
      cell: (row) => (
        <span className="flex flex-row items-start gap-2">
          {row.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("artifactName", {
      header: "Artifacts",
      id: "artifactName",
      enableSorting: false,
      cell: (row) => (
        <ArtifactBadge key={row.getValue()} artifactName={row.getValue()} />
      ),
    }),
  ];

  const { data: components, isLoading } = useSWR<Paged<ProjectDependency>>(
    url + "?" + params?.toString(),
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

  const { table } = useTable({
    data: (components?.data ?? []) as Array<ProjectDependency>,
    columnsDef,
  });

  return (
    <Page Menu={menu} Title={null} title="">
      <Section
        primaryHeadline
        forceVertical
        description="Search for every Dependency in your Organization"
        title="Project Dependencies"
      >
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="relative flex-1">
            <Input
              onChange={(e) => handleSearch(e.target.value)}
              defaultValue={searchParams?.get("search") as string}
              placeholder="Search for dependencies"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 ">
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        {!components?.data.length ? (
          <EmptyParty
            title="No matching results."
            description={`The package ${searchParams?.get("search")} could not be found in any repository currently associated with your organization.`}
          />
        ) : (
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
                          className="flex flex-row items-center gap-2"
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
                      key={i}
                    >
                      <td className="p-4">
                        <Skeleton className="w-2/3 h-[20px]" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="w-1/2 h-[20px]" />
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
                  <a
                    href={`/${organizationSlug}/projects/${project.slug}/assets/${row.original.assetSlug}/refs/${row.original.assetVersionName}/dependencies`}
                    className={classNames(
                      "relative cursor-pointer table-row bg-background align-top transition-all ",
                      index === arr.length - 1 ? "" : "border-b",
                      index % 2 != 0 && "bg-card/50",
                    )}
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td className="p-4 text-foreground" key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </a>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {components && <CustomPagination {...components} />}
        <div className="flex flex-row justify-end"></div>
      </Section>
    </Page>
  );
};
export default OrgDependencySearch;
