// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useApiQuery } from "@/hooks/useApiQuery";

export const useRedmineIntegrationProperties = (
  organization: string,
  integrationId: string,
) =>
  useApiQuery(
    "/organizations/{organization}/integrations/redmine/{redmine_integration_id}/properties",
    {
      params: {
        path: {
          organization,
          redmine_integration_id: integrationId,
        },
      },
    },
  );
