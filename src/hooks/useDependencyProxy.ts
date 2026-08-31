// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import useSWR from "swr";

import { browserClient, unwrap } from "@/services/apiClient";
import type { ConfigScope } from "@/services/configFileService";
import { readConfigFile, writeConfigFile } from "@/services/configFileService";
import type { DependencyProxyConfig } from "@/types/view/dependencyProxy";

export type ProxyScope = ConfigScope;

const CONFIG_FILE = "dependency-proxy-configs";

const readProxyUrls = (scope: ProxyScope) => {
  switch (scope.level) {
    case "organization":
      return browserClient.GET(
        "/organizations/{organization}/dependency-proxy-urls/",
        { params: { path: { organization: scope.organization } } },
      );
    case "project":
      return browserClient.GET(
        "/organizations/{organization}/projects/{projectSlug}/dependency-proxy-urls/",
        {
          params: {
            path: {
              organization: scope.organization,
              projectSlug: scope.projectSlug,
            },
          },
        },
      );
    case "asset":
      return browserClient.GET(
        "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/dependency-proxy-urls/",
        {
          params: {
            path: {
              organization: scope.organization,
              projectSlug: scope.projectSlug,
              assetSlug: scope.assetSlug,
            },
          },
        },
      );
  }
};

export const useDependencyProxy = (scope: ProxyScope | null) => {
  const config = useSWR(
    scope && (["dependency-proxy-config", scope] as const),
    async ([, proxyScope]) => {
      const result = await readConfigFile(proxyScope, CONFIG_FILE);
      // an unset config answers 404
      if (result.response.status === 404) return null;
      return JSON.parse(unwrap(result)) as DependencyProxyConfig;
    },
  );

  const proxyUrls = useSWR(
    scope && (["dependency-proxy-urls", scope] as const),
    async ([, proxyScope]) => unwrap(await readProxyUrls(proxyScope)),
  );

  const saveConfig = async (next: DependencyProxyConfig) => {
    if (!scope) return;
    unwrap(await writeConfigFile(scope, CONFIG_FILE, JSON.stringify(next)));
    await config.mutate();
  };

  return {
    config: config.data,
    proxyUrls: proxyUrls.data,
    saveConfig,
  };
};
