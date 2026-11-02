// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { MaybeOptionalInit, MethodResponse } from "openapi-fetch";
import type { PathsWithMethod } from "openapi-typescript-helpers";
import useSWR from "swr";
import type { SWRConfiguration } from "swr";
import { browserClient, unwrap } from "@/services/apiClient";
import type { paths } from "@/types/api/generated";

type GetPath = PathsWithMethod<paths, "get">;

export function useApiQuery<
  Path extends GetPath,
  Init extends MaybeOptionalInit<paths[Path], "get">,
>(
  path: Path | null,
  init?: Init,
  swrConfig?: SWRConfiguration<
    MethodResponse<typeof browserClient, "get", Path>
  >,
) {
  return useSWR(
    path === null ? null : ([path, init] as const),
    async ([requestPath, requestInit]) =>
      unwrap(
        await browserClient.GET(requestPath, requestInit as never),
      ) as MethodResponse<typeof browserClient, "get", Path>,
    swrConfig,
  );
}

export function useApiQueryWithTransformer<
  Path extends GetPath,
  Init extends MaybeOptionalInit<paths[Path], "get">,
  T = MethodResponse<typeof browserClient, "get", Path>,
>(
  path: Path | null,
  callback?: (
    data: MethodResponse<typeof browserClient, "get", Path>,
  ) => T | Promise<T>,
  init?: Init,
  swrConfig?: SWRConfiguration<T>,
) {
  return useSWR(
    path === null ? null : ([path, init] as const),
    async ([requestPath, requestInit]) => {
      const response = unwrap(
        await browserClient.GET(requestPath, requestInit as never),
      ) as MethodResponse<typeof browserClient, "get", Path>;
      if (callback) {
        return await callback(response);
      }
      return response as unknown as T;
    },
    swrConfig,
  );
}
