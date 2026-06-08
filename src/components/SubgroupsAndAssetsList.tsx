"use client";

import type { ProjectDTO, SubGroupsAndAsset } from "../types/api/api";
import NestedList from "./group-list/NestedList";
import ProjectRow from "./group-list/ProjectRow";

export { isProject, checkType } from "./group-list/utils";

interface Props {
  project?: ProjectDTO;
  subgroupsWithAssets?: SubGroupsAndAsset[];
  onFetchData: (projectSlug: string, projectId: string) => any;
  error?: Error;
  projectSlug: string;
}

export default function SubgroupsAndAssetsList({
  project,
  subgroupsWithAssets,
  onFetchData,
  error,
  projectSlug,
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
      parentProjectSlug={projectSlug}
    />
  );
}
