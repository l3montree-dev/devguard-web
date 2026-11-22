// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useCallback, useMemo } from "react";
import useSWR from "swr";

import { fetcher } from "@/data-fetcher/fetcher";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useComplianceComponents } from "@/hooks/useCompliancePostures";
import type { ComplianceScope } from "@/services/compliancePostureService";
import { catalogsUrl } from "@/services/oscalDocumentService";
import type { ScopeFrameworkDTO } from "@/types/dto";

// "own" documents were activated on the current level and can be removed here,
// all others are inherited from the named level.
export type OscalDocumentOrigin = "own" | "organization" | "project" | "asset";

export interface OscalDocumentEntry {
  name: string;
  origin: OscalDocumentOrigin;
}

const useDocumentOrigin = (scope: ComplianceScope) => {
  const project = useActiveProject();
  const asset = useActiveAsset();

  return useCallback(
    (item: {
      projectId?: string | null;
      assetId?: string | null;
    }): OscalDocumentOrigin => {
      const level = item.assetId
        ? "asset"
        : item.projectId
          ? "project"
          : "organization";
      if (level !== scope.level) {
        return level;
      }
      // a project inherits from its parent projects, so the level alone is not enough
      if (level === "project" && item.projectId !== project?.id) {
        return level;
      }
      if (level === "asset" && item.assetId !== asset?.id) {
        return level;
      }
      return "own";
    },
    [scope.level, project?.id, asset?.id],
  );
};

export const useCatalogs = (scope: ComplianceScope) => {
  const origin = useDocumentOrigin(scope);
  const { data, isLoading, mutate } = useSWR<ScopeFrameworkDTO[]>(
    catalogsUrl(scope),
    fetcher,
  );
  const catalogs = useMemo<OscalDocumentEntry[]>(
    () =>
      (data ?? []).map((sf) => ({ name: sf.framework, origin: origin(sf) })),
    [data, origin],
  );
  return { data: catalogs, isLoading, mutate };
};

// There is no list route for component definitions, they are derived from the
// components which apply to the scope.
export const useComponentDefinitions = (scope: ComplianceScope) => {
  const origin = useDocumentOrigin(scope);
  const { data, isLoading, mutate } = useComplianceComponents(scope);
  const definitions = useMemo<OscalDocumentEntry[]>(() => {
    const byName = new Map<string, OscalDocumentEntry>();
    for (const component of data ?? []) {
      if (!component.componentDefinition) continue;
      if (!byName.has(component.componentDefinition)) {
        byName.set(component.componentDefinition, {
          name: component.componentDefinition,
          origin: origin(component),
        });
      }
    }
    return [...byName.values()];
  }, [data, origin]);
  return { data: definitions, isLoading, mutate };
};
