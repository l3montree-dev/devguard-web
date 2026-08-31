// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import useSWR from "swr";

import { fetcher } from "@/data-fetcher/fetcher";
import type { ProjectDTO } from "@/types/dto";
import type { Paged } from "@/types/view/pagination";
import type { SubGroupsAndAsset } from "@/types/view/project";

// Not on the generated client: both routes take dynamic filterQuery[field][op]
// keys, which OpenAPI cannot express. Searching returns matching projects with
// their children, so the children are what this flattens to.
export const useProjectResources = (
  organization: string | undefined,
  projectSlug: string,
  parentId: string,
  query: URLSearchParams,
  isSearchActive: boolean,
) => {
  const url = (() => {
    if (!organization) return null;
    const orgSlug = decodeURIComponent(organization);
    if (isSearchActive) {
      return `/organizations/${orgSlug}/projects/search?parentId=${parentId}&${query.toString()}`;
    }
    const base = `/organizations/${orgSlug}/projects/${decodeURIComponent(projectSlug)}/resources?parentId=${parentId}`;
    const search = query.toString();
    return search ? `${base}&${search}` : base;
  })();

  return useSWR<Paged<SubGroupsAndAsset>>(
    url,
    async (requestUrl: string) => {
      if (!isSearchActive) return fetcher<Paged<SubGroupsAndAsset>>(requestUrl);
      const raw =
        await fetcher<
          Paged<ProjectDTO & { subGroupsAndAsset: SubGroupsAndAsset[] | null }>
        >(requestUrl);
      return {
        ...raw,
        data: raw.data.flatMap((item) => item.subGroupsAndAsset ?? []),
      };
    },
    { keepPreviousData: true },
  );
};
