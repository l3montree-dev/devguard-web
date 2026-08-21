"use client";

import type { ProjectDTO, SubGroupsAndAsset } from "../types/api/api";
import NestedList from "./group-list/NestedList";
import ProjectRow from "./group-list/ProjectRow";

export { checkType } from "./group-list/utils";

interface Props {
  project?: ProjectDTO;
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
