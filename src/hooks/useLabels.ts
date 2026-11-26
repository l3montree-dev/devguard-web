// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import useSWR from "swr";

import { fetcher } from "@/data-fetcher/fetcher";
import type { ConfigScope } from "@/services/configFileService";
import { labelsUrl } from "@/services/labelService";
import type { Label } from "@/services/labelService";

export const useLabels = (scope: ConfigScope | null) =>
  useSWR<Label[]>(scope && labelsUrl(scope), fetcher);
