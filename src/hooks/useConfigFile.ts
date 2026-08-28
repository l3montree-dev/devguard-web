// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import useSWR from "swr";

import { unwrap } from "@/services/apiClient";
import type { ConfigScope } from "@/services/configFileService";
import { readConfigFile, writeConfigFile } from "@/services/configFileService";

export const useConfigFile = (
  scope: ConfigScope | null,
  configFile: string | null,
) => {
  const { data, mutate } = useSWR(
    scope && configFile ? (["config-file", scope, configFile] as const) : null,
    async ([, configScope, name]) => {
      const result = await readConfigFile(configScope, name);
      // an unset config file answers 404
      if (result.response.status === 404) return "";
      return unwrap(result);
    },
  );

  const save = async (content: string) => {
    if (!scope || !configFile) return;
    unwrap(await writeConfigFile(scope, configFile, content));
    await mutate(content, { revalidate: false });
  };

  return { content: data, save, mutate };
};
