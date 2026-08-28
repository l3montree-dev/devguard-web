// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { InstanceInfo } from "@/types/api/api";
import useSWR from "swr";
import { browserApiClient } from "../services/devGuardApi";

const fetcher = (url: string) =>
  browserApiClient(url).then((res) => (res.ok ? res.json() : null));

export const useInstanceInfo = () => {
  
  const { data: info } = useSWR<InstanceInfo>("/info/", fetcher);

  return {
    apiVersion: info?.build.version ?? null,
    // omitted by the API until the first vulndb import finished
    vulndbVersion: info?.database.vulndbVersion ?? null,
    // null while /info is still unknown - only false means "not imported yet"
    vulndbInitialized: info ? Boolean(info.database.vulndbVersion) : null,
  };
};
