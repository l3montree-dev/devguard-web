// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useApiQuery } from "@/hooks/useApiQuery";

export const useIntegrationRepositories = (organization: string) => {
  const { data, isLoading } = useApiQuery(
    "/organizations/{organization}/integrations/repositories",
    { params: { path: { organization } } },
  );

  return { repositories: data ?? [], isLoading };
};
