// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import ConnectToRepoSection from "@/components/ConnectToRepoSection";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetScope } from "@/hooks/useAssetScope";
import { useAssetUpdate } from "@/hooks/useAssetUpdate";
import { useIntegrationRepositories } from "@/hooks/useIntegrationRepositories";
import { convertRepos } from "@/hooks/useRepositorySearch";
import { getParentRepositoryIdAndName } from "@/utils/view";
import { useMemo } from "react";

const RepositorySettings = () => {
  const asset = useActiveAsset()!;
  const project = useActiveProject()!;
  const { organization } = useAssetScope();
  const handleUpdate = useAssetUpdate();
  const { repositories } = useIntegrationRepositories(organization);
  const options = useMemo(() => convertRepos(repositories), [repositories]);
  const { parentRepositoryId, parentRepositoryName } =
    getParentRepositoryIdAndName(project);

  return (
    <ConnectToRepoSection
      forceVertical
      primaryHeadline
      parentRepositoryId={parentRepositoryId}
      parentRepositoryName={parentRepositoryName}
      repositoryName={asset.repositoryName}
      repositoryId={asset.repositoryId}
      repositories={options}
      onUpdate={handleUpdate}
    />
  );
};

export default RepositorySettings;
