// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/services/apiClient";
import { useActiveOrg } from "./useActiveOrg";

export const convertRepos = (repos: Array<{ label: string; id: string }>) =>
  repos.map((r) => ({ value: r.id, label: r.label }));

export default function useRepositorySearch(
  repositories: Array<{ value: string; label: string }> | null,
) {
  const activeOrg = useActiveOrg();
  const [searchResults, setSearchResults] = useState<Array<{
    value: string;
    label: string;
  }> | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const search = useCallback(
    async (query: string) => {
      setSearchLoading(true);
      const resp = await apiFetch(
        "/organizations/" +
          activeOrg.slug +
          "/integrations/repositories?search=" +
          query,
      );

      setSearchResults(convertRepos(await resp.json()));
      setSearchLoading(false);
    },
    [activeOrg.slug],
  );

  const debouncedSearch = useMemo(() => debounce(search, 500), [search]);

  useEffect(() => debouncedSearch.cancel, [debouncedSearch]);

  const handleSearchRepos = async (value: string) => {
    if (value === "") {
      debouncedSearch.cancel();
      setSearchResults(null);
      return;
    }
    debouncedSearch(value);
  };

  return {
    repos: searchResults ?? repositories ?? [],
    searchLoading,
    handleSearchRepos,
  };
}
