// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { FunctionComponent, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { BarsArrowUpIcon, BarsArrowDownIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/utils";
import useRouterQuery from "@/hooks/useRouterQuery";
import { useSearchParams } from "next/navigation";

export interface SortOption {
  label: string;
  value: string;
}

export const buildSortQuery = (
  sortOptions: SortOption[],
  sortBy: string,
  sortDirection: "asc" | "desc",
): Record<string, string | undefined> => {
  const query: Record<string, string | undefined> = {};
  sortOptions.forEach((o) => {
    query[`sort[${o.value}]`] = undefined;
  });
  query[`sort[${sortBy}]`] = sortDirection;
  return query;
};

interface Props {
  sortOptions: [SortOption, ...SortOption[]];
}

const Sort: FunctionComponent<Props> = ({ sortOptions }) => {
  const pushQuery = useRouterQuery();
  const searchParams = useSearchParams();
  const initialSortOption = sortOptions.find(
    (o) => searchParams?.get(`sort[${o.value}]`) !== null,
  );
  const [sortBy, setSortBy] = useState<string>(
    initialSortOption?.value ?? sortOptions[0].value,
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSortOption
      ? ((searchParams?.get(`sort[${initialSortOption.value}]`) as
          | "asc"
          | "desc") ?? "asc")
      : "asc",
  );

  const selectedLabel =
    sortOptions.find((o) => o.value === sortBy)?.label ?? sortBy;

  return (
    <div
      className={cn("flex h-10 rounded-md border flex flex-row items-center")}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="border-0">
            {selectedLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuRadioGroup
            value={sortBy}
            onValueChange={(value) => {
              setSortBy(value);
              pushQuery({
                ...buildSortQuery(sortOptions, value, sortDirection),
                page: "1",
              });
            }}
          >
            {sortOptions.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        className=" border-0 "
        size={"sm"}
        onClick={() => {
          const newDirection = sortDirection === "asc" ? "desc" : "asc";
          setSortDirection(newDirection);
          pushQuery({
            ...buildSortQuery(sortOptions, sortBy, newDirection),
            page: "1",
          });
        }}
        aria-label="Toggle sort direction"
      >
        {sortDirection === "asc" ? (
          <BarsArrowUpIcon className="w-5 h-5 text-muted-foreground" />
        ) : (
          <BarsArrowDownIcon className="w-5 h-5 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
};

export default Sort;
