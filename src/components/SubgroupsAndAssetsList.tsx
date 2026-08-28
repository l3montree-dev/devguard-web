// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import type { SubGroupProject, SubGroupsAndAsset } from "@/types/view/project";
import NestedList from "./group-list/NestedList";
import ProjectRow from "./group-list/ProjectRow";

export { checkType } from "./group-list/utils";

interface Props {
  project?: SubGroupProject;
  subgroupsWithAssets?: SubGroupsAndAsset[];
  onFetchData: (projectSlug: string, projectId: string) => any;
  error?: Error;
  isLoading?: boolean;
  projectSlug: string;
  Empty?: React.ReactNode;
}

export default function SubgroupsAndAssetsList({
  project,
  subgroupsWithAssets,
  onFetchData,
  error,
  isLoading,
  projectSlug,
  Empty,
}: Props) {
  if (project) {
    return (
      <ProjectRow
        project={project}
        subgroupsWithAssets={subgroupsWithAssets}
        onFetchData={onFetchData}
        error={error}
        depth="root"
      />
    );
  }

  return (
    <NestedList
      items={subgroupsWithAssets}
      onFetchData={onFetchData}
      error={error}
      isLoading={isLoading}
      parentProjectSlug={projectSlug}
      Empty={Empty}
    />
  );
}
