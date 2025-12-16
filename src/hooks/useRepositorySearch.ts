import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { browserApiClient } from "../services/devGuardApi";
import { useActiveOrg } from "./useActiveOrg";

export const convertRepos = (repos: Array<{ label: string; id: string }>) =>
  repos.map((r) => ({ value: r.id, label: r.label }));

export default function useRepositorySearch(
  repositories: Array<{ value: string; label: string }> | null,
) {
  const activeOrg = useActiveOrg();
  const [repos, setRepositories] = useState(repositories ?? []);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    setRepositories(repositories ?? []);
  }, [repositories]);

  const debouncedSearch = useCallback(
    debounce(async (search: string) => {
      if (search === "") {
        setRepositories(repositories ?? []);
        return;
      }
      setSearchLoading(true);
      // fetch repositories from the server
      const repos = await browserApiClient(
        "/organizations/" +
          activeOrg.slug +
          "/integrations/repositories?search=" +
          search,
      );

      const data = await repos.json();
      setRepositories(convertRepos(data) ?? []);
      setSearchLoading(false);
    }, 500),
    [activeOrg.slug],
  );

  const handleSearchRepos = async (value: string) => {
    if (value === "") {
      setRepositories(repositories ?? []);
      return;
    }
    return debouncedSearch(value);
  };

  return { repos, searchLoading, handleSearchRepos };
}
