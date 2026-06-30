"use client";

import AssetTitle from "@/components/common/AssetTitle";
import Page from "@/components/Page";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useDecodedParams from "@/hooks/useDecodedParams";
import Section from "@/components/common/Section";
import { Button } from "@/components/ui/button";
import AuthGuard from "@/components/AuthGuard";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useRouterQuery from "@/hooks/useRouterQuery";
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
import useSWR, { mutate } from "swr";
import { fetcher } from "@/data-fetcher/fetcher";
import useTable from "@/hooks/useTable";
import SortingCaret from "@/components/common/SortingCaret";
import { classNames } from "@/utils/common";
import { getSeverityClassNames } from "@/components/common/Severity";
import type { FunctionComponent } from "react";
import { useMemo, useState } from "react";
import { buildFilterSearchParams } from "@/utils/url";
import { browserApiClient } from "@/services/devGuardApi";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import AdvisoryDialog, {
  type AdvisoryFormData,
} from "@/components/AdvisoryDialog";
import { toast } from "@/lib/toast";
import { vectorStringToScore } from "@/utils/cvss";

const columnHelper = createColumnHelper<SecurityAdvisory>();

const columnsDef: ColumnDef<SecurityAdvisory, any>[] = [
  columnHelper.accessor("title", {
    header: "Title",
    enableSorting: true,
    cell: (info) => {
      return (
        info.getValue() && (
          <div className="w-full text-base text-muted-foreground">
            {info.getValue()}
          </div>
        )
      );
    },
  }),

  columnHelper.accessor("severity", {
    header: "Severity",
    enableSorting: true,
    meta: { className: "w-40 whitespace-nowrap" },
    cell: (info) => {
      const severity = info.getValue();
      if (!severity) return null;
      const score = vectorStringToScore(info.row.original.vectorstring ?? "");
      return (
        <span
          className={classNames(
            "inline-flex px-2 py-0.5 text-xs font-medium rounded-full",
            getSeverityClassNames(String(severity).toUpperCase(), false),
          )}
        >
          {severity}
          {score !== null && ` (${score.toFixed(1)})`}
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

  const advisoryUrl = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/advisory`;

  const searchParams = useSearchParams();
  const push = useRouterQuery();

  const visibility =
    searchParams?.get("visibility") === "public" ? "public" : "draft";

  const advisoryListUrl = useMemo(() => {
    const p = buildFilterSearchParams(searchParams);
    if (!searchParams?.has("pageSize")) p.set("pageSize", "10");
    p.append("filterQuery[visibility][is]", visibility);
    return `${advisoryUrl}?${p.toString()}`;
  }, [searchParams, advisoryUrl, visibility]);

  const {
    data: advisories,
    isLoading,
    error,
  } = useSWR<Paged<SecurityAdvisory>>(
    advisoryListUrl,
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

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateAdvisory = async (data: AdvisoryFormData) => {
    const resp = await browserApiClient(advisoryUrl + "/", {
      method: "POST",
      body: JSON.stringify({ ...data, assetID: assetId }),
    });
    if (resp.ok) {
      toast.success("Security Advisory created successfully!");
      mutate(advisoryListUrl);
    } else {
      const msg = await resp.text();
      toast.error("Failed to create advisory: " + msg);
      throw new Error(msg);
    }
  };

  if (error) return <div>Failed to load advisories</div>;

  return (
    <Page Menu={assetMenu} title={"Security Advisory"} Title={<AssetTitle />}>
      {dialogOpen && (
        <AdvisoryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleCreateAdvisory}
        />
      )}
      <div className="flex flex-row items-center justify-end">
        <div className="flex flex-row gap-2">
          <AuthGuard require="admin">
            <Button onClick={() => setDialogOpen(true)} variant="default">
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
        <div className="flex flex-1 flex-col gap-2">
          <Tabs value={visibility}>
            <TabsList>
              <TabsTrigger
                onClick={() => push({ visibility: "draft", page: 1 })}
                value="draft"
              >
                Draft
              </TabsTrigger>
              <TabsTrigger
                onClick={() => push({ visibility: "public", page: 1 })}
                value="public"
              >
                Public
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
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
                            className={classNames(
                              "cursor-pointer whitespace-nowrap break-normal p-4 text-left",
                              (header.column.columnDef.meta as any)?.className,
                            )}
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
                          <td
                            className={classNames(
                              "p-4",
                              (cell.column.columnDef.meta as any)?.className,
                            )}
                            key={cell.id}
                          >
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
