// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { browserClient, unwrap } from "@/services/apiClient";
import type { components } from "@/types/api/generated";

export type WebhookScope =
  | { level: "organization"; organization: string }
  | { level: "project"; organization: string; projectSlug: string };

export type WebhookSaveRequest =
  components["schemas"]["dtos.WebhookCreateRequestDTO"];
export type WebhookUpdateRequest =
  components["schemas"]["dtos.WebhookUpdateRequestDTO"];
export type WebhookTestRequest =
  components["schemas"]["dtos.WebhookTestRequestDTO"];

export const saveWebhook = async (
  scope: WebhookScope,
  body: WebhookSaveRequest,
) =>
  scope.level === "organization"
    ? unwrap(
        await browserClient.POST(
          "/organizations/{organization}/integrations/webhook/test-and-save",
          { params: { path: { organization: scope.organization } }, body },
        ),
      )
    : unwrap(
        await browserClient.POST(
          "/organizations/{organization}/projects/{projectSlug}/integrations/webhook/test-and-save",
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

export const updateWebhook = async (
  scope: WebhookScope,
  id: string,
  body: WebhookUpdateRequest,
) =>
  scope.level === "organization"
    ? unwrap(
        await browserClient.PUT(
          "/organizations/{organization}/integrations/webhook/{id}",
          { params: { path: { organization: scope.organization, id } }, body },
        ),
      )
    : unwrap(
        await browserClient.PUT(
          "/organizations/{organization}/projects/{projectSlug}/integrations/webhook/{id}",
          {
            params: {
              path: {
                organization: scope.organization,
                projectSlug: scope.projectSlug,
                id,
              },
            },
            body,
          },
        ),
      );

export const deleteWebhook = async (scope: WebhookScope, id: string) =>
  scope.level === "organization"
    ? unwrap(
        await browserClient.DELETE(
          "/organizations/{organization}/integrations/webhook/{id}",
          { params: { path: { organization: scope.organization, id } } },
        ),
      )
    : unwrap(
        await browserClient.DELETE(
          "/organizations/{organization}/projects/{projectSlug}/integrations/webhook/{id}",
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

export const testWebhook = async (
  scope: WebhookScope,
  body: WebhookTestRequest,
) =>
  scope.level === "organization"
    ? unwrap(
        await browserClient.POST(
          "/organizations/{organization}/integrations/webhook/test",
          { params: { path: { organization: scope.organization } }, body },
        ),
      )
    : unwrap(
        await browserClient.POST(
          "/organizations/{organization}/projects/{projectSlug}/integrations/webhook/test",
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
