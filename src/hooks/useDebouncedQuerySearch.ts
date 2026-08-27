// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { debounce } from "lodash";
import useRouterQuery from "./useRouterQuery";
import { useMemo } from "react";

export default function useDebouncedQuerySearch() {
  const updateQueryParams = useRouterQuery();
  const handleSearch = useMemo(
    () =>
      debounce((value: string) => {
        updateQueryParams({
          search: value || undefined,
          page: 1,
        });
      }, 500),
    [updateQueryParams],
  );
  return handleSearch;
}
