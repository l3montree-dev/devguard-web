// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { WebhookDTO } from "@/types/dto";
import { useApiQuery } from "@/hooks/useApiQuery";
import type { WebhookScope } from "@/services/webhookService";

// Webhooks come back as part of the org settings / project details payload
// rather than from a list route of their own, so updates patch that payload.
export const useWebhooks = (scope: WebhookScope) => {
  const org = useApiQuery(
    scope.level === "organization"
      ? "/organizations/{organization}/settings"
      : null,
    { params: { path: { organization: scope.organization } } },
  );
  const project = useApiQuery(
    scope.level === "project"
      ? "/organizations/{organization}/projects/{projectSlug}"
      : null,
    {
      params: {
        path: {
          organization: scope.organization,
          projectSlug: scope.level === "project" ? scope.projectSlug : "",
        },
      },
    },
  );

  const source = scope.level === "organization" ? org : project;

  // the two responses have different payload types, so each branch patches its
  // own cache entry
  const mutateWebhooks = (
    update: (previous: WebhookDTO[]) => WebhookDTO[],
    options?: { revalidate?: boolean },
  ) =>
    scope.level === "organization"
      ? org.mutate(
          (previous) =>
            previous && {
              ...previous,
              webhooks: update(previous.webhooks as WebhookDTO[]) as never,
            },
          options,
        )
      : project.mutate(
          (previous) =>
            previous && {
              ...previous,
              webhooks: update(previous.webhooks as WebhookDTO[]) as never,
            },
          options,
        );

  return {
    webhooks: (source.data?.webhooks ?? []) as WebhookDTO[],
    webhooksLoading: source.isLoading,
    mutateWebhooks,
  };
};
