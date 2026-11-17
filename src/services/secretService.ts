// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { browserClient, unwrap } from "@/services/apiClient";
import type { ConfigScope } from "@/services/configFileService";
import type { components } from "@/types/api/generated";

export type SecretCreateRequest =
  components["schemas"]["dtos.SecretCreateRequest"];

export const secretsUrl = (scope: ConfigScope) => {
  switch (scope.level) {
    case "organization":
      return `/organizations/${scope.organization}/secrets/`;
    case "project":
      return `/organizations/${scope.organization}/projects/${scope.projectSlug}/secrets/`;
    case "asset":
      return `/organizations/${scope.organization}/projects/${scope.projectSlug}/assets/${scope.assetSlug}/secrets/`;
  }
};

export const createSecret = async (
  scope: ConfigScope,
  body: SecretCreateRequest,
) => {
  switch (scope.level) {
    case "organization":
      return unwrap(
        await browserClient.POST("/organizations/{organization}/secrets", {
          params: { path: { organization: scope.organization } },
          body,
        }),
      );
    case "project":
      return unwrap(
        await browserClient.POST(
          "/organizations/{organization}/projects/{projectSlug}/secrets",
          {
            params: {
              path: {
                organization: scope.organization,
                projectSlug: scope.projectSlug,
              },
            },
            body,
          },
        ),
      );
    case "asset":
      return unwrap(
        await browserClient.POST(
          "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/secrets",
          {
            params: {
              path: {
                organization: scope.organization,
                projectSlug: scope.projectSlug,
                assetSlug: scope.assetSlug,
              },
            },
            body,
          },
        ),
      );
  }
};

export const deleteSecret = async (scope: ConfigScope, id: string) => {
  switch (scope.level) {
    case "organization":
      return unwrap(
        await browserClient.DELETE(
          "/organizations/{organization}/secrets/{id}",
          { params: { path: { organization: scope.organization, id } } },
        ),
      );
    case "project":
      return unwrap(
        await browserClient.DELETE(
          "/organizations/{organization}/projects/{projectSlug}/secrets/{id}",
          {
            params: {
              path: {
                organization: scope.organization,
                projectSlug: scope.projectSlug,
                id,
              },
            },
          },
        ),
      );
    case "asset":
      return unwrap(
        await browserClient.DELETE(
          "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/secrets/{id}",
          {
            params: {
              path: {
                organization: scope.organization,
                projectSlug: scope.projectSlug,
                assetSlug: scope.assetSlug,
                id,
              },
            },
          },
        ),
      );
  }
};
