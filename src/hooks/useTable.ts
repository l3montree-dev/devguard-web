// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import {
  columnVisibilityFeature,
  createSortedRowModel,
  createTableHook,
  rowSortingFeature,
  sortFns,
  tableFeatures,
} from "@tanstack/react-table";
import type { ColumnDef, RowData, TableOptions } from "@tanstack/react-table";
import useFilter from "./useFilter";

export const features = tableFeatures({
  columnVisibilityFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
});

export type TableFeatures = typeof features;

export type TableColumnDef<T extends RowData, TValue = unknown> = ColumnDef<
  TableFeatures,
  T,
  TValue
>;

export const { useAppTable, createAppColumnHelper } = createTableHook({
  features,
});

export default function useTable<T extends RowData>(
  {
    data,
    columnsDef,
  }: {
    data: T[];
    columnsDef: TableColumnDef<T, any>[];
  },
  additionalOptions?: Partial<TableOptions<TableFeatures, T>>,
) {
  const {
    handleFilter,
    removeFilter,
    clearAllFilters,
    sortingState,
    handleSort,
  } = useFilter();

  const table = useAppTable({
    columns: columnsDef,
    data: data,
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
