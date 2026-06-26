"use client";

import AssetTitle from "@/components/common/AssetTitle";
import Page from "@/components/Page";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useDecodedParams from "@/hooks/useDecodedParams";
import Section from "@/components/common/Section";
import { Button } from "@/components/ui/button";
import AuthGuard from "@/components/AuthGuard";
import { useRouter, usePathname } from "next/navigation";
import EmptyParty from "@/components/common/EmptyParty";
import { Loader2 } from "lucide-react";
import CustomPagination from "@/components/common/CustomPagination";
import {
  createColumnHelper,
  flexRender,
  getSortedRowModel,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { SecurityAdvisory, Paged } from "@/types/api/api";
import useSWR from "swr";
import { fetcher } from "@/data-fetcher/fetcher";
import useTable from "@/hooks/useTable";
import SortingCaret from "@/components/common/SortingCaret";
import { classNames } from "@/utils/common";
import { Skeleton } from "../../../../../../../../../../components/ui/skeleton";
import type { FunctionComponent } from "react";
import { browserApiClient } from "@/services/devGuardApi";
import { useActiveAsset } from "@/hooks/useActiveAsset";

const columnHelper = createColumnHelper<SecurityAdvisory>();

const columnsDef: ColumnDef<SecurityAdvisory, any>[] = [
  columnHelper.accessor("title", {
    header: "Title",
    enableSorting: true,
    cell: (info) => {
      return (
        info.getValue() && (
          <div className="w-52 text-base text-muted-foreground">
            {info.getValue()}
          </div>
        )
      );
    },
  }),

  columnHelper.accessor("severity", {
    header: "Severity",
    enableSorting: true,
    cell: (info) => {
      return (
        <span className="text-base text-muted-foreground">
          {info.getValue()}
        </span>
      );
    },
  }),
];

const Index: FunctionComponent = () => {
  const asset = useActiveAsset();
  const assetId = asset?.id;
  const router = useRouter();
  const pathname = usePathname();
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    useDecodedParams() as {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
    };
  const {
    data: advisories,
    isLoading,
    error,
  } = useSWR<Paged<SecurityAdvisory>>(
    `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/advisory`,
    (url: string) =>
      fetcher(url).then((res: SecurityAdvisory[] | Paged<SecurityAdvisory>) =>
        Array.isArray(res)
          ? { data: res, total: res.length, page: 0, pageSize: res.length }
          : res,
      ),
    { keepPreviousData: true },
  );
  const assetMenu = useAssetMenu();
  const { table } = useTable(
    { columnsDef, data: advisories?.data || [] },
    { getSortedRowModel: getSortedRowModel(), manualSorting: false },
  );
  if (error) return <div>Fehler beim Laden</div>;

  const clickerPOST = async () => {
    const resp = await browserApiClient(
      "/organizations/" +
        organizationSlug +
        "/projects/" +
        projectSlug +
        "/assets/" +
        assetSlug +
        "/refs/" +
        assetVersionSlug +
        "/advisory/",
      {
        method: "POST",
        body: JSON.stringify({
          title: "Das ist eine 67",
          description:
            "# Title This is a **bold** statement and *italic* text.- Item 1- Item 2> This is a blockquote.| Name | Age ||------|-----|| John | 30  |",
          severity: "Critical",
          vectorstring:
            "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N",
          affectedPackages: [
            {
              ecosystem: "go",
              packageName: "pkg:gogogo",
              semverStart: "0.0.0",
              semverEnd: "1.2.0",
            },
            {
              ecosystem: "afgo",
              packageName: "pkg:afafaafgogogo",
              semverStart: "0.0.1",
              semverEnd: "1.2.0",
            },
          ],
          assetId: assetId,
        }),
      },
    );
  };

  return (
    <Page Menu={assetMenu} title={"Security Advisory"} Title={<AssetTitle />}>
      <div className="flex flex-row items-center justify-end">
        <div className="flex flex-row gap-2">
          <AuthGuard require="member">
            <Button onClick={clickerPOST} variant="default">
              Create Security Advisory
            </Button>
          </AuthGuard>
        </div>
      </div>
      <Section
        forceVertical
        primaryHeadline
        title="Security Advisories"
        description="This table shows all the created security advisories of this repository."
        className="mb-4 mt-4"
      >
        <div className="absolute right-2 top-1/2 -translate-y-1/2 ">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </Section>
      {!advisories?.data?.length ? (
        <div>
          <EmptyParty
            title="No matching results."
            description="Security advisories are intended to enable you to create and publish your own vulnerability reports. This process is done by identifying, creating, and publishing advisories."
          />
        </div>
      ) : (
        <div>
          <div>
            <div className="overflow-hidden rounded-lg border shadow-sm">
              <div className="overflow-auto">
                <table className="w-full overflow-x-auto text-sm">
                  <thead className="border-b bg-card text-foreground">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            className="cursor-pointer whitespace-nowrap break-normal p-4 text-left"
                            onClick={
                              header.column.columnDef.enableSorting
                                ? header.column.getToggleSortingHandler()
                                : undefined
                            }
                            key={header.id}
                          >
                            <div className="flex flex-row items-center gap-2">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
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
                  <tbody className="text-sm text-foreground">
                    {!table.getRowModel().rows &&
                      isLoading &&
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
                            <Skeleton className="w-1/2 h-[20px]" />
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
                      <tr
                        onClick={() =>
                          router?.push(pathname + "/" + row.original.id)
                        }
                        className={classNames(
                          "relative cursor-pointer align-top transition-all",
                          i === arr.length - 1 ? "" : "border-b",
                          i % 2 != 0 && "bg-card/50",
                          "hover:bg-muted",
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
            </div>
            <div className="mt-4">
              {advisories && <CustomPagination {...advisories} />}
            </div>
          </div>
        </div>
      )}
    </Page>
  );
};

export default Index;
