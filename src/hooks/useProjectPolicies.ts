// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useApiQuery } from "@/hooks/useApiQuery";
import {
  disableProjectPolicy,
  enableProjectPolicy,
} from "@/services/policyService";
import type { ProjectScope } from "@/services/projectService";
import type { Policy } from "@/types/dto";

export type ProjectPolicy = Policy & { enabled: boolean };

// The project route lists only the enabled policies, so the org list is what
// gives us the full set to render. Toggling mutates the enabled list.
export const useProjectPolicies = (scope: ProjectScope) => {
  const all = useApiQuery("/organizations/{organization}/policies", {
    params: { path: { organization: scope.organization } },
  });
  const enabled = useApiQuery(
    "/organizations/{organization}/projects/{projectSlug}/policies",
    { params: { path: scope } },
  );

  const policies = all.data?.map((policy) => ({
    ...policy,
    enabled: Boolean(enabled.data?.some((p) => p.id === policy.id)),
  })) as ProjectPolicy[] | undefined;

  const enablePolicy = (policy: Policy) =>
    enabled.mutate(
      async (prev) => {
        await enableProjectPolicy(
          scope.organization,
          scope.projectSlug,
          policy.id,
        );
        return [...(prev ?? []), policy];
      },
      {
        optimisticData: (prev) => [...(prev ?? []), policy],
        rollbackOnError: true,
      },
    );

  const disablePolicy = (policy: Policy) =>
    enabled.mutate(
      async (prev) => {
        await disableProjectPolicy(
          scope.organization,
          scope.projectSlug,
          policy.id,
        );
        return prev?.filter((p) => p.id !== policy.id) ?? [];
      },
      {
        optimisticData: (prev) => prev?.filter((p) => p.id !== policy.id) ?? [],
        rollbackOnError: true,
      },
    );

  return {
    policies,
    isLoading: all.isLoading || enabled.isLoading,
    error: all.error ?? enabled.error,
    enablePolicy,
    disablePolicy,
  };
};
