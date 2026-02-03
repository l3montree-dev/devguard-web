import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  TableOptions,
} from "@tanstack/react-table";
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
  const { sortingState, handleSort } = useFilter();

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
  };
}
