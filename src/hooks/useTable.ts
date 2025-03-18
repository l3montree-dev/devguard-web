import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { debounce } from "lodash";
import router, { useRouter } from "next/router";
import { useMemo, useState } from "react";
import useFilter from "./useFilter";

export default function useTable<T>({
  data,
  columnsDef,
}: {
  data: T[];
  columnsDef: ColumnDef<T>[];
}) {
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
  });

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = useMemo(
    () =>
      debounce((e: React.ChangeEvent<HTMLInputElement>) => {
        setIsLoading(true);
        // remove all sorting query params
        const params = router.query;
        if (e.target.value === "") {
          delete params["search"];
          router.push({
            query: params,
          });
        } else if (e.target.value.length >= 3) {
          router.push({
            query: {
              ...params,
              search: e.target.value,
            },
          });
        }
        setIsLoading(false);
      }, 500),
    [router],
  );

  return {
    table,
    handleSearch,
    isLoading,
  };
}
