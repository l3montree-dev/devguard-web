import { debounce } from "lodash";
import useRouterQuery from "./useRouterQuery";
import { ChangeEvent, useMemo } from "react";

export default function useDebouncedQuerySearch() {
  const updateQueryParams = useRouterQuery();
  const handleSearch = useMemo(
    () =>
      debounce((v: ChangeEvent<HTMLInputElement>) => {
        updateQueryParams({
          search: v.target.value,
        });
      }, 500),
    [updateQueryParams],
  );
  return handleSearch;
}
