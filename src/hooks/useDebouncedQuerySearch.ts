import { debounce } from "lodash";
import useRouterQuery from "./useRouterQuery";
import { useMemo } from "react";

export default function useDebouncedQuerySearch() {
  const updateQueryParams = useRouterQuery();
  const handleSearch = useMemo(
    () =>
      debounce((value: string) => {
        updateQueryParams({
          search: value,
        });
      }, 500),
    [updateQueryParams],
  );
  return handleSearch;
}
