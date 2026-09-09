// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { fetcher } from "@/data-fetcher/fetcher";
import type { Paged } from "@/types/view/pagination";
import type { Log } from "@/types/view/logs";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import useDecodedParams from "./useDecodedParams";

export const useLogs = () => {
  const { organizationSlug, projectSlug, assetSlug } = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
  };

  const searchParams = useSearchParams();
  const query = searchParams?.toString();
  const url =
    `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/logs` +
    (query ? `?${query}` : "");
  return useSWR<Paged<Log>>(url, fetcher, { keepPreviousData: true });
};
