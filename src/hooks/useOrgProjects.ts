// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import useSWR from "swr";

import { fetcher } from "@/data-fetcher/fetcher";
import type { ProjectDTO } from "@/types/dto";
import type { Paged } from "@/types/view/pagination";
import type { SubGroupsAndAsset } from "@/types/view/project";

// Not on the generated client: the list takes dynamic filterQuery[field][op]
// keys, which OpenAPI cannot express.
export const useOrgProjects = (
  organization: string,
  query: URLSearchParams,
  isSearchActive: boolean,
) => {
  const base = `/organizations/${decodeURIComponent(organization)}/projects`;
  const url = `${base}${isSearchActive ? "/search" : "/"}?${query.toString()}`;

  return useSWR<Paged<SubGroupsAndAsset>>(
    url,
    async (requestUrl: string) => {
      const data = await fetcher<Paged<ProjectDTO>>(requestUrl);
      // the list endpoint returns plain projects; the nested tree is fetched
      // lazily, so drop it here rather than pretend it is the frontend shape
      return {
        ...data,
        data: data.data.map(({ subGroupsAndAsset: _nested, ...item }) => ({
          ...item,
          resourceType: "project" as const,
        })),
      } satisfies Paged<SubGroupsAndAsset>;
    },
    { keepPreviousData: true },
  );
};
