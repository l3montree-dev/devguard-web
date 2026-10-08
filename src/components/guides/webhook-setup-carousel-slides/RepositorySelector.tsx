// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { AssetFormValues } from "@/types/view/asset";
import { Combobox } from "@/components/common/Combobox";
import ListItem from "@/components/common/ListItem";
import {
  innerCardClassName,
  innerInputVariant,
  type Surface,
} from "@/lib/surface";
import { Button } from "@/components/ui/button";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveProject } from "@/hooks/useActiveProject";
import useRepositorySearch, { convertRepos } from "@/hooks/useRepositorySearch";
import { patchAsset } from "@/services/assetService";
import { useIntegrationRepositories } from "@/hooks/useIntegrationRepositories";
import { useMemo, useState } from "react";
import { toast } from "@/lib/toast";
import { useUpdateAsset } from "../../../context/AssetContext";
import { useActiveOrg } from "../../../hooks/useActiveOrg";

interface RepositorySelectorProps {
  repositoryName?: string;
  repositoryId?: string;
  // the surface the selector is rendered on
  variant?: Surface;
}

// combobox to connect the asset with a repository of one of the org integrations
export default function RepositorySelector({
  repositoryName,
  repositoryId,
  variant,
}: RepositorySelectorProps) {
  const activeOrg = useActiveOrg();
  const hasIntegration =
    activeOrg.gitLabIntegrations.length > 0 ||
    activeOrg.githubAppInstallations.length > 0 ||
    activeOrg.jiraIntegrations.length > 0;

  const [_editRepo, setEditRepo] = useState(!Boolean(repositoryId));

  const [selectedRepo, setSelectedRepo] = useState<{
    id: string;
    name: string;
  } | null>(repositoryId ? { id: repositoryId!, name: repositoryName! } : null);

  const [repoSelectedAndSet, setRepoSelectedAndSet] = useState(
    Boolean(repositoryId) && Boolean(repositoryName),
  );

  const asset = useActiveAsset()!;
  const project = useActiveProject();
  const updateAsset = useUpdateAsset();

  const handleUpdateSelectedRepository = async (
    data: Partial<AssetFormValues>,
  ) => {
    let updated;
    try {
      updated = await patchAsset(
        {
          organization: activeOrg.slug,
          projectSlug: project!.slug, // can never be null
          assetSlug: asset.slug,
        },
        data as never,
      );
    } catch {
      toast.error("Failed to connect repository. Please try again.");
      return;
    }

    updateAsset(updated as never);
    toast.success("Repository connected successfully.");
  };

  const {
    repositories: fetchedRepositories,
    isLoading: isLoadingRepositories,
  } = useIntegrationRepositories(activeOrg.slug);

  const repositories = useMemo(
    () => convertRepos(fetchedRepositories),
    [fetchedRepositories],
  );

  const { repos, searchLoading, handleSearchRepos } =
    useRepositorySearch(repositories);

  return (
    <ListItem
      className={innerCardClassName(variant)}
      Title={
        <div className="flex flex-row gap-2">
          <div
            className={`flex-1 min-w-0  ${!hasIntegration ? "pointer-events-none opacity-50" : ""}`}
          >
            <Combobox
              data-testid="repo-selector"
              variant={innerInputVariant(variant)}
              onValueChange={handleSearchRepos}
              placeholder="Search repository..."
              items={repos}
              loading={isLoadingRepositories || searchLoading}
              onSelect={(repoId: string) => {
                const repo = repos.find((r) => r.value === repoId);
                if (repo) {
                  setSelectedRepo({ id: repo.value, name: repo.label });
                }
              }}
              value={selectedRepo?.id ?? undefined}
              emptyMessage="No repositories found"
            />
          </div>
          <div className="flex-shrink-0">
            {repoSelectedAndSet ? (
              <Button
                variant={"destructive"}
                onClick={async () => {
                  if (selectedRepo) {
                    await handleUpdateSelectedRepository({
                      repositoryId: "",
                      repositoryName: "",
                    });
                    setSelectedRepo(null);
                    setRepoSelectedAndSet(false);
                  }
                }}
              >
                Disconnect
              </Button>
            ) : (
              <Button
                data-testid="connect-repository-button"
                onClick={async () => {
                  if (selectedRepo) {
                    await handleUpdateSelectedRepository({
                      repositoryId: selectedRepo.id,
                      repositoryName: selectedRepo.name,
                    });
                    setEditRepo(false);
                    setRepoSelectedAndSet(true);
                  }
                }}
                disabled={!Boolean(selectedRepo) || !hasIntegration}
                variant="default"
              >
                Connect
              </Button>
            )}
          </div>
        </div>
      }
      Description={
        "Select a repository to connect this repository to. This will enable you to open and handle issues in the target repository. The list contains all repositories of all GitHub App, GitLab and Jira integrations in this organization."
      }
    />
  );
}
