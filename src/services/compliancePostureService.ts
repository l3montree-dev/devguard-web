// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { browserClient, unwrap } from "@/services/apiClient";
import type { components } from "@/types/api/generated";

export type PostureScope =
  | { level: "organization"; organization: string }
  | { level: "project"; organization: string; projectSlug: string }
  | {
      level: "assetVersion";
      organization: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
    };

// The handler binds only these two fields.
export type StatementPayload =
  components["schemas"]["controllers.statementPayload"];

export interface PostureEvent {
  status?: string;
  justification?: string;
}

// The list, stats and oscal routes take dynamic filterQuery[field][op] keys,
// which OpenAPI cannot express, so they stay URL based.
export const postureBaseUrl = (scope: PostureScope) => {
  switch (scope.level) {
    case "organization":
      return `/organizations/${scope.organization}/compliance-postures/`;
    case "project":
      return `/organizations/${scope.organization}/projects/${scope.projectSlug}/compliance-postures/`;
    case "assetVersion":
      return `/organizations/${scope.organization}/projects/${scope.projectSlug}/assets/${scope.assetSlug}/refs/${scope.assetVersionSlug}/compliance-postures/`;
  }
};

export const readPosture = async (
  scope: PostureScope,
  frameworkControlID: string,
) => {
  switch (scope.level) {
    case "organization":
      return unwrap(
        await browserClient.GET(
          "/organizations/{organization}/compliance-postures/{frameworkControlID}",
          {
            params: {
              path: {
                organization: scope.organization,
                frameworkControlID,
              },
            },
          },
        ),
      );
    case "project":
      return unwrap(
        await browserClient.GET(
          "/organizations/{organization}/projects/{projectSlug}/compliance-postures/{frameworkControlID}",
          {
            params: {
              path: {
                organization: scope.organization,
                projectSlug: scope.projectSlug,
                frameworkControlID,
              },
            },
          },
        ),
      );
    case "assetVersion":
      return unwrap(
        await browserClient.GET(
          "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/compliance-postures/{frameworkControlID}",
          {
            params: {
              path: {
                organization: scope.organization,
                projectSlug: scope.projectSlug,
                assetSlug: scope.assetSlug,
                assetVersionSlug: scope.assetVersionSlug,
                frameworkControlID,
              },
            },
          },
        ),
      );
  }
};

export const createPostureEvent = async (
  scope: PostureScope,
  frameworkControlID: string,
  event: PostureEvent,
) => {
  switch (scope.level) {
    case "organization":
      return unwrap(
        await browserClient.POST(
          "/organizations/{organization}/compliance-postures/{frameworkControlID}",
          {
            params: {
              path: { organization: scope.organization, frameworkControlID },
            },
            body: event,
          },
        ),
      );
    case "project":
      return unwrap(
        await browserClient.POST(
          "/organizations/{organization}/projects/{projectSlug}/compliance-postures/{frameworkControlID}",
          {
            params: {
              path: {
                organization: scope.organization,
                projectSlug: scope.projectSlug,
                frameworkControlID,
              },
            },
            body: event,
          },
        ),
      );
    case "assetVersion":
      return unwrap(
        await browserClient.POST(
          "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/compliance-postures/{frameworkControlID}",
          {
            params: {
              path: {
                organization: scope.organization,
                projectSlug: scope.projectSlug,
                assetSlug: scope.assetSlug,
                assetVersionSlug: scope.assetVersionSlug,
                frameworkControlID,
              },
            },
            body: event,
          },
        ),
      );
  }
};

export const deleteStatement = async (
  scope: PostureScope,
  statementID: string,
) => {
  switch (scope.level) {
    case "organization":
      return unwrap(
        await browserClient.DELETE(
          "/organizations/{organization}/compliance-postures/components/{statementID}/",
          {
            params: {
              path: { organization: scope.organization, statementID },
            },
          },
        ),
      );
    case "project":
      return unwrap(
        await browserClient.DELETE(
          "/organizations/{organization}/projects/{projectSlug}/compliance-postures/components/{statementID}",
          {
            params: {
              path: {
                organization: scope.organization,
                projectSlug: scope.projectSlug,
                statementID,
              },
            },
          },
        ),
      );
    case "assetVersion":
      return unwrap(
        await browserClient.DELETE(
          "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/compliance-postures/components/{statementID}",
          {
            params: {
              path: {
                organization: scope.organization,
                projectSlug: scope.projectSlug,
                assetSlug: scope.assetSlug,
                assetVersionSlug: scope.assetVersionSlug,
                statementID,
              },
            },
          },
        ),
      );
  }
};

export const createStatement = async (
  scope: PostureScope,
  frameworkControlID: string,
  complianceComponentID: string,
  body: StatementPayload,
) => {
  switch (scope.level) {
    case "organization":
      return unwrap(
        await browserClient.POST(
          "/organizations/{organization}/compliance-postures/{frameworkControlID}/components/{complianceComponentID}/",
          {
            params: {
              path: {
                organization: scope.organization,
                frameworkControlID,
                complianceComponentID,
              },
            },
            body,
          },
        ),
      );
    case "project":
      return unwrap(
        await browserClient.POST(
          "/organizations/{organization}/projects/{projectSlug}/compliance-postures/{frameworkControlID}/components/{complianceComponentID}",
          {
            params: {
              path: {
                organization: scope.organization,
                projectSlug: scope.projectSlug,
                frameworkControlID,
                complianceComponentID,
              },
            },
            body,
          },
        ),
      );
    case "assetVersion":
      return unwrap(
        await browserClient.POST(
          "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/compliance-postures/{frameworkControlID}/components/{complianceComponentID}",
          {
            params: {
              path: {
                organization: scope.organization,
                projectSlug: scope.projectSlug,
                assetSlug: scope.assetSlug,
                assetVersionSlug: scope.assetVersionSlug,
                frameworkControlID,
                complianceComponentID,
              },
            },
            body,
          },
        ),
      );
  }
};
