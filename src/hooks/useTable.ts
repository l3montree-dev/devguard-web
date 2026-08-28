// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { ColumnDef, TableOptions } from "@tanstack/react-table";
import useFilter from "./useFilter";

export default function useTable<T>(
  {
    data,
    columnsDef,
  }: {
    data: T[];
    columnsDef: ColumnDef<T>[];
  },
  additionalOptions?: Partial<TableOptions<T>>,
) {
  const {
    handleFilter,
    removeFilter,
    clearAllFilters,
    sortingState,
    handleSort,
  } = useFilter();

  const table = useReactTable({
    columns: columnsDef,
    data: data,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: handleSort,
    manualSorting: true,
    state: {
      sorting: sortingState,
    },
    ...additionalOptions,
  });

  return {
    table,
    handleFilter,
    removeFilter,
    clearAllFilters,
  };
}
