// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import useSWR from "swr";

import { fetcher } from "@/data-fetcher/fetcher";
import type { ConfigScope } from "@/services/configFileService";
import { secretsUrl } from "@/services/secretService";
import type { SecretDTO } from "@/types/dto";

export const useSecrets = (scope: ConfigScope | null) =>
  useSWR<SecretDTO[]>(scope && secretsUrl(scope), fetcher, {
    fallbackData: [],
  });
