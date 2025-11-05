"use client";

import Section from "@/components/common/Section";
import Page from "@/components/Page";
import { ComponentPaged, OrgDependency, Paged, Policy } from "@/types/api/api";
import { FunctionComponent, useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import EmptyParty from "../../../../components/common/EmptyParty";
import ListRenderer from "../../../../components/common/ListRenderer";
import PolicyListItem from "../../../../components/common/PolicyListItem";
import PolicyDialog from "../../../../components/PolicyDialog";
import { Button } from "../../../../components/ui/button";
import { fetcher } from "../../../../data-fetcher/fetcher";
import useDecodedParams from "../../../../hooks/useDecodedParams";
import { useOrganizationMenu } from "../../../../hooks/useOrganizationMenu";
import { browserApiClient } from "../../../../services/devGuardApi";
import useDebouncedQuerySearch from "@/hooks/useDebouncedQuerySearch";
import { Skeleton } from "@/components/ui/skeleton";
import useTable from "@/hooks/useTable";
import { beautifyPurl, classNames } from "@/utils/common";
import SortingCaret from "@/components/common/SortingCaret";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { QueryArtifactSelector } from "@/components/ArtifactSelector";
import {
  flexRender,
  ColumnDef,
  createColumnHelper,
  Header,
} from "@tanstack/react-table";
import { useSearchParams } from "next/dist/client/components/navigation";

import { buildFilterSearchParams } from "@/utils/url";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import EcosystemImage from "@/components/common/EcosystemImage";
import CustomPagination from "@/components/common/CustomPagination";

const OrgDependencySearch: FunctionComponent = () => {
  const menu = useOrganizationMenu();
  const { organizationSlug } = useDecodedParams() as {
    organizationSlug: string;
  };

  // localhost:8080/api/v1/organizations/org/dependency-components/?search=alpine

  const url = "/organizations/" + organizationSlug + "/dependency-components/";
  const handleSearch = useDebouncedQuerySearch();
  const searchParams = useSearchParams();
  //  /dependency-components/?search=alpine";

  const params = useMemo(() => {
    const params = buildFilterSearchParams(searchParams);

    return params;
  }, [searchParams]);

  const columnHelper = createColumnHelper<OrgDependency>();

  const columnsDef: ColumnDef<OrgDependency, any>[] = [
    columnHelper.accessor("componentPurl", {
      header: "Package",
      id: "componentPurl",
      cell: (row) => (
        <span className="flex flex-row items-start gap-2">
          <EcosystemImage packageName={row.getValue()} />
          {beautifyPurl(row.getValue())}
        </span>
      ),
    }),

    columnHelper.accessor("componentVersion", {
      header: "Version",
      id: "componentVersion",
      cell: (row) => (
        <span className="flex flex-row items-start gap-2">
          <Badge variant={"secondary"}> {row.getValue()}</Badge>
        </span>
      ),
    }),
    columnHelper.accessor("organizationName", {
      header: "Organization",
      id: "organizationName",
      cell: (row) => (
        <span className="flex flex-row items-start gap-2">
          {row.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("projectName", {
      header: "Project",
      id: "projectName",
      cell: (row) => (
        <span className="flex flex-row items-start gap-2">
          {row.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("assetName", {
      header: "Repository",
      id: "assetName",
      cell: (row) => (
        <span className="flex flex-row items-start gap-2">
          {row.getValue()}
        </span>
      ),
    }),
  ];

  const { data: components, isLoading } = useSWR<Paged<OrgDependency>>(
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
    data: (components?.data ?? []) as Array<OrgDependency>,
    columnsDef,
  });

  const renderHeaderCell = (header: Header<OrgDependency, unknown>) => {
    switch (header.id) {
      case "organizationName":
        return (
          <Badge variant={"outline"}>
            {flexRender(header.column.columnDef.header, header.getContext())}
          </Badge>
        );
      case "projectName":
        return (
          <Badge variant={"outline"}>
            {flexRender(header.column.columnDef.header, header.getContext())}
          </Badge>
        );
      case "assetName":
        return (
          <Badge variant={"outline"}>
            {flexRender(header.column.columnDef.header, header.getContext())}
          </Badge>
        );
      default:
        return flexRender(header.column.columnDef.header, header.getContext());
    }
  };

  console.log(components);

  return (
    <Page Menu={menu} Title={null} title="">
      <Section
        primaryHeadline
        forceVertical
        description="Search for every Dependency in your Organization"
        title="Organization Dependencies"
      >
        <div className="flex flex-row items-center justify-between gap-2">
          {/* <QueryArtifactSelector
            unassignPossible
            artifacts={(artifacts ?? []).map((a) => a.artifactName)}
          /> */}
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
                          {renderHeaderCell(header)}
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
                    //   onClick={() => dataPassthrough(row.original)}
                    className={classNames(
                      "relative cursor-pointer bg-background align-top transition-all ",
                      index === arr.length - 1 ? "" : "border-b",
                      index % 2 != 0 && "bg-card/50",
                    )}
                    key={row.original.componentDependencyId}
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
        )}
        {components && <CustomPagination {...components} />}
        <div className="flex flex-row justify-end">
          {/* <AsyncButton onClick={handleLicenseRefresh} variant={"ghost"}>
            Refresh Licenses
          </AsyncButton> */}
        </div>
      </Section>
    </Page>
  );
};
export default OrgDependencySearch;
