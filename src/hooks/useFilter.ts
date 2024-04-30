import {
  FilterForm,
  filterForm2Query,
  sortingState2Query,
} from "@/services/filter";
import { SortingState } from "@tanstack/react-table";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function useFilter() {
  const router = useRouter();

  const handleFilter = (data: FilterForm) => {
    // push the filter to the query params
    // get the current params first
    const params = router.query;

    router.push({
      query: {
        ...params,
        ...filterForm2Query(data),
      },
    });
  };

  const [sortingState, setSortingState] = useState<SortingState>([]);

  const removeFilter = (f: FilterForm) => {
    // remove the filter from the query params
    // get the current params first
    const params = router.query;

    delete params["filterQuery[" + f.field + "][" + f.operator + "]"];

    router.push({
      query: params,
    });
  };

  useEffect(() => {
    // remove all sorting query params
    const params = router.query;

    router.push({
      query: {
        ...Object.fromEntries(
          Object.entries(params).filter(([k]) => !k.startsWith("sort[")),
        ),
        ...sortingState2Query(sortingState),
      },
    });
  }, [sortingState]);

  return {
    handleFilter,
    removeFilter,
    handleSort: setSortingState,
    sortingState,
  };
}
