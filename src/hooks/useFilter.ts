import {
  FilterForm,
  filterForm2Query,
  sortingState2Query,
} from "@/services/filter";
import { OnChangeFn, SortingState, Updater } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function useFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleFilter = (data: FilterForm) => {
    // push the filter to the query params
    // get the current params first
    const newSearchParams = new URLSearchParams(filterForm2Query(data));
    searchParams?.forEach((value, key) => {
      if (!newSearchParams.has(key)) newSearchParams.set(key, value);
    });
    router.push(pathname + "?" + searchParams?.toString());
  };

  const [sortingState, setSortingState] = useState<SortingState>([]);

  const removeFilter = (f: FilterForm) => {
    // remove the filter from the query params
    // get the current params first
    const copied = new URLSearchParams(searchParams || {});
    copied.delete("filterQuery[" + f.field + "][" + f.operator + "]");
    router.push(pathname + "?" + copied.toString());
  };

  const handleSetSortingState: OnChangeFn<SortingState> = (
    newState: Updater<SortingState>,
  ) => {
    let newStateObject: SortingState;
    if (newState instanceof Function) {
      newStateObject = newState(sortingState);
    } else {
      newStateObject = newState;
    }

    // remove all sorting query params
    const params = Object.fromEntries(searchParams?.entries() || []);
    const paramsWithoutSort = Object.entries(params).filter(
      ([k]) => !k.startsWith("sort["),
    );

    const s = sortingState2Query(newStateObject);
    const finalParams = new URLSearchParams({
      ...Object.fromEntries(paramsWithoutSort),
      ...s,
    });

    router.push(pathname + "?" + finalParams.toString());
    setSortingState(newStateObject);
  };

  return {
    handleFilter,
    removeFilter,
    handleSort: handleSetSortingState,
    sortingState,
  };
}
