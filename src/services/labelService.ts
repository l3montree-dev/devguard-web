// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { browserClient, unwrap } from "@/services/apiClient";
import type { ConfigScope } from "@/services/configFileService";
import type { components } from "@/types/api/generated";

export type LabelCreateRequest = components["schemas"]["dtos.LabelRequest"];
export type Label =
  components["schemas"]["github_com_l3montree-dev_devguard_database_models.Label"];

export const labelsUrl = (scope: ConfigScope) => {
  switch (scope.level) {
    case "organization":
      return `/organizations/${scope.organization}/labels/`;
    case "project":
      return `/organizations/${scope.organization}/projects/${scope.projectSlug}/labels/`;
    case "asset":
      return `/organizations/${scope.organization}/projects/${scope.projectSlug}/assets/${scope.assetSlug}/labels/`;
  }
};

// the level a label was created on, taken from the most specific id it has
const labelLevel = (label: Label): ConfigScope["level"] =>
  label.assetID ? "asset" : label.projectID ? "project" : "organization";

// the level a label is inherited from, undefined if it was created in this scope
export const inheritedFrom = (label: Label, scope: ConfigScope) => {
  const level = labelLevel(label);
  return level === scope.level ? undefined : level;
};

export const createLabel = async (
  scope: ConfigScope,
  body: LabelCreateRequest,
) => {
  switch (scope.level) {
    case "organization":
      return unwrap(
        await browserClient.POST("/organizations/{organization}/labels/", {
          params: {
            path: {
              organization: scope.organization,
              projectSlug: "",
              assetSlug: "",
            },
          },
          body,
        }),
      );
    case "project":
      return unwrap(
        await browserClient.POST(
          "/organizations/{organization}/projects/{projectSlug}/labels/",
          {
            params: {
              path: {
                organization: scope.organization,
                projectSlug: scope.projectSlug,
                assetSlug: "",
              },
            },
            body,
          },
        ),
      );
    case "asset":
      return unwrap(
        await browserClient.POST(
          "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/labels/",
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

export const updateLabel = async (
  scope: ConfigScope,
  body: LabelCreateRequest,
  labelID: string,
) => {
  switch (scope.level) {
    case "organization":
      return unwrap(
        await browserClient.PUT(
          "/organizations/{organization}/labels/{labelID}/",
          {
            params: {
              path: {
                organization: scope.organization,
                projectSlug: "",
                assetSlug: "",
                labelID,
              },
            },
            body,
          },
        ),
      );
    case "project":
      return unwrap(
        await browserClient.PUT(
          "/organizations/{organization}/projects/{projectSlug}/labels/{labelID}/",
          {
            params: {
              path: {
                organization: scope.organization,
                projectSlug: scope.projectSlug,
                assetSlug: "",
                labelID,
              },
            },
            body,
          },
        ),
      );
    case "asset":
      return unwrap(
        await browserClient.PUT(
          "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/labels/{labelID}/",
          {
            params: {
              path: {
                organization: scope.organization,
                projectSlug: scope.projectSlug,
                assetSlug: scope.assetSlug,
                labelID,
              },
            },
            body,
          },
        ),
      );
  }
};

export const deleteLabel = async (scope: ConfigScope, labelID: string) => {
  switch (scope.level) {
    case "organization":
      return unwrap(
        await browserClient.DELETE(
          "/organizations/{organization}/labels/{labelID}/",
          {
            params: {
              path: {
                organization: scope.organization,
                projectSlug: "",
                assetSlug: "",
                labelID,
              },
            },
          },
        ),
      );
    case "project":
      return unwrap(
        await browserClient.DELETE(
          "/organizations/{organization}/projects/{projectSlug}/labels/{labelID}/",
          {
            params: {
              path: {
                organization: scope.organization,
                projectSlug: scope.projectSlug,
                assetSlug: "",
                labelID,
              },
            },
          },
        ),
      );
    case "asset":
      return unwrap(
        await browserClient.DELETE(
          "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/labels/{labelID}/",
          {
            params: {
              path: {
                organization: scope.organization,
                projectSlug: scope.projectSlug,
                assetSlug: scope.assetSlug,
                labelID,
              },
            },
          },
        ),
      );
  }
};
