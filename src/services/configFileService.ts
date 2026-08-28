// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { browserClient } from "@/services/apiClient";

export type ConfigScope =
  | { level: "organization"; organization: string }
  | { level: "project"; organization: string; projectSlug: string }
  | {
      level: "asset";
      organization: string;
      projectSlug: string;
      assetSlug: string;
    };

// Config files are stored as opaque strings, so the routes speak text/plain.
const text = { parseAs: "text" as const };

export const readConfigFile = (scope: ConfigScope, configFile: string) => {
  const params = { "config-file": configFile };
  switch (scope.level) {
    case "organization":
      return browserClient.GET(
        "/organizations/{organization}/config-files/{config-file}",
        {
          ...text,
          params: {
            path: { ...params, organization: scope.organization },
          },
        },
      );
    case "project":
      return browserClient.GET(
        "/organizations/{organization}/projects/{projectSlug}/config-files/{config-file}",
        {
          ...text,
          params: {
            path: {
              ...params,
              organization: scope.organization,
              projectSlug: scope.projectSlug,
            },
          },
        },
      );
    case "asset":
      return browserClient.GET(
        "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/config-files/{config-file}",
        {
          ...text,
          params: {
            path: {
              ...params,
              organization: scope.organization,
              projectSlug: scope.projectSlug,
              assetSlug: scope.assetSlug,
            },
          },
        },
      );
  }
};

export const writeConfigFile = (
  scope: ConfigScope,
  configFile: string,
  body: string,
) => {
  const params = { "config-file": configFile };
  switch (scope.level) {
    case "organization":
      return browserClient.PUT(
        "/organizations/{organization}/config-files/{config-file}",
        {
          ...text,
          params: { path: { ...params, organization: scope.organization } },
          body,
        },
      );
    case "project":
      return browserClient.PUT(
        "/organizations/{organization}/projects/{projectSlug}/config-files/{config-file}",
        {
          ...text,
          params: {
            path: {
              ...params,
              organization: scope.organization,
              projectSlug: scope.projectSlug,
            },
          },
          body,
        },
      );
    case "asset":
      return browserClient.PUT(
        "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/config-files/{config-file}",
        {
          ...text,
          params: {
            path: {
              ...params,
              organization: scope.organization,
              projectSlug: scope.projectSlug,
              assetSlug: scope.assetSlug,
            },
          },
          body,
        },
      );
  }
};
