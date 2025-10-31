"use client";

import SortingCaret from "@/components/common/SortingCaret";
import { useAssetMenu } from "@/hooks/useAssetMenu";

import Page from "@/components/Page";
import { FirstPartyVuln, Paged } from "@/types/api/api";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { FunctionComponent, useMemo, useState } from "react";

import { classNames } from "@/utils/common";

import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import CustomPagination from "@/components/common/CustomPagination";
import EmptyParty from "@/components/common/EmptyParty";
import Section from "@/components/common/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAssetBranchesAndTags } from "@/hooks/useActiveAssetVersion";
import useTable from "@/hooks/useTable";
import { buildFilterSearchParams } from "@/utils/url";
import { Loader2 } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { CopyCodeFragment } from "../../../../../../../../../../components/common/CopyCode";
import RiskScannerDialog from "../../../../../../../../../../components/RiskScannerDialog";
import { Badge } from "../../../../../../../../../../components/ui/badge";
import { Skeleton } from "../../../../../../../../../../components/ui/skeleton";
import { useConfig } from "../../../../../../../../../../context/ConfigContext";
import { fetcher } from "../../../../../../../../../../data-fetcher/fetcher";
import useDebouncedQuerySearch from "../../../../../../../../../../hooks/useDebouncedQuerySearch";
import useDecodedParams from "../../../../../../../../../../hooks/useDecodedParams";
import useRouterQuery from "../../../../../../../../../../hooks/useRouterQuery";
import { defaultScanner } from "../../../../../../../../../../utils/view";

interface Props {
  vulns: Paged<FirstPartyVuln>;
}

const columnHelper = createColumnHelper<FirstPartyVuln>();

const columnsDef: ColumnDef<FirstPartyVuln, any>[] = [
  columnHelper.accessor("uri", {
    header: "Filename",
    cell: (info) => {
      return (
        info.getValue() && (
          <div className="w-52">
            <CopyCodeFragment codeString={info.getValue()} />
          </div>
        )
      );
    },
  }),

  columnHelper.accessor("message", {
    header: "Message",
    cell: (info) => {
      return (
        <span className="text-sm text-muted-foreground">{info.getValue()}</span>
      );
    },
  }),
  columnHelper.accessor("scannerIds", {
    header: "Scanner",
    cell: (info) => {
      return (
        <Badge className="whitespace-nowrap" variant={"secondary"}>
          {info.getValue().replace(defaultScanner, "")}
        </Badge>
      );
    },
  }),
];

const Index: FunctionComponent = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  let { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    useDecodedParams() as {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
    };

  const searchParams = useSearchParams();

  const query = useMemo(() => {
    const p = buildFilterSearchParams(searchParams);
    const state = searchParams?.get("state");
    if (!Boolean(state) || state === "open") {
      p.append("filterQuery[state][is]", "open");
    } else {
      p.append("filterQuery[state][is not]", "open");
    }

    return p;
  }, [searchParams]);

  const uri =
    "/organizations/" +
    organizationSlug +
    "/projects/" +
    projectSlug +
    "/assets/" +
    assetSlug +
    "/";

  const {
    data: vulns,
    isLoading,
    error,
  } = useSWR<Paged<FirstPartyVuln>>(
    uri +
      "refs/" +
      assetVersionSlug +
      "/" +
      "first-party-vulns/?" +
      query.toString(),
    fetcher,
  );

  const { table } = useTable({
    columnsDef,
    data: vulns?.data || [],
  });

  const handleSearch = useDebouncedQuerySearch();

  const assetMenu = useAssetMenu();
  const config = useConfig();

  const { branches, tags } = useAssetBranchesAndTags();

  const params = useSearchParams();
  const pathname = usePathname();
  const push = useRouterQuery();

  return (
    <Page Menu={assetMenu} title={"Risk Handling"} Title={<AssetTitle />}>
      <div className="flex flex-row items-center justify-between">
        <BranchTagSelector branches={branches} tags={tags} />
        <Button onClick={() => setIsOpen(true)} variant="default">
          Identify Risks
        </Button>
      </div>
      <Section
        forceVertical
        primaryHeadline
        title="Identified Risks"
        description="This table shows all the identified risks for this repository."
        className="mb-4 mt-4"
      >
        <div className="relative flex flex-row gap-2">
          <Tabs
            defaultValue={
              params?.has("state") ? (params.get("state") as string) : "open"
            }
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
            defaultValue={params?.get("search") ?? ""}
            placeholder="Search for filename, message or scanner..."
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
            </div>
            <div className="mt-4">
              {vulns && <CustomPagination {...vulns} />}
            </div>
          </div>
        </div>
      )}
      <RiskScannerDialog
        apiUrl={config.devguardApiUrlPublicInternet}
        frontendUrl={config.frontendUrl}
        devguardCIComponentBase={config.devguardCIComponentBase}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </Page>
  );
};

export default Index;
