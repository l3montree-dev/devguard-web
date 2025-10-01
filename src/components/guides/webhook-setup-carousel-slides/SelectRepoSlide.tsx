import { AssetFormValues } from "@/components/asset/AssetForm";
import { Combobox } from "@/components/common/Combobox";
import ListItem from "@/components/common/ListItem";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CarouselApi, CarouselItem } from "@/components/ui/carousel";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveProject } from "@/hooks/useActiveProject";
import useRepositorySearch, { convertRepos } from "@/hooks/useRepositorySearch";
import { browserApiClient } from "@/services/devGuardApi";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActiveOrg } from "../../../hooks/useActiveOrg";
import { useStore } from "../../../zustand/globalStoreProvider";
import { useUpdateAsset } from "../../../context/AssetContext";

interface StartSlideProps {
  api?: {
    scrollTo: (index: number) => void;
  };
  repositories: Array<{ value: string; label: string }> | null;
  repositoryName?: string;
  repositoryId?: string;
  afterSuccessfulConnectionSlideIndex: number;
  prevIndex: number;
}

export default function SelectRepoSlide({
  repositoryName,
  repositoryId,
  api,
  afterSuccessfulConnectionSlideIndex,
  prevIndex,
}: StartSlideProps) {
  const activeOrg = useActiveOrg();
  const hasIntegration =
    activeOrg.gitLabIntegrations.length > 0 ||
    activeOrg.githubAppInstallations.length > 0 ||
    activeOrg.jiraIntegrations.length > 0;

  const [editRepo, setEditRepo] = useState(!Boolean(repositoryId));

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
    const resp = await browserApiClient(
      "/organizations/" +
        activeOrg.slug +
        "/projects/" +
        project!.slug + // can never be null
        "/assets/" +
        asset.slug,
      {
        method: "PATCH",
        body: JSON.stringify({
          ...data,
        }),
      },
    );

    if (!resp.ok) {
      toast.error("Failed to connect repository. Please try again.");
      return;
    }
    if (resp.ok) {
      const r = await resp.json();
      updateAsset(r);
      toast.success("Repository connected successfully.");
    }
  };

  const [repositories, setRepositories] = useState<
    { value: string; label: string }[] | null
  >(null);

  const { handleSearchRepos } = useRepositorySearch(repositories);

  const [isLoadingRepositories, setIsLoadingRepositories] = useState(false);

  useEffect(() => {
    const fetchRepositories = async () => {
      setIsLoadingRepositories(true);
      const [repoResp] = await Promise.all([
        browserApiClient(
          "/organizations/" + activeOrg.slug + "/integrations/repositories",
        ),
      ]);
      if (repoResp.ok) {
        const data = await repoResp.json();
        setRepositories(convertRepos(data));
      } else {
        toast.error("Failed to fetch repositories. Please try again.");
      }
      setIsLoadingRepositories(false);
    };
    fetchRepositories();
  }, [
    activeOrg.gitLabIntegrations,
    activeOrg.githubAppInstallations,
    activeOrg.jiraIntegrations,
    activeOrg.slug,
  ]);

  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>
          Select your Repository to connect with DevGuard
        </DialogTitle>
      </DialogHeader>
      <div className="mt-10 px-1">
        <ListItem
          Title={
            <div className="flex flex-row gap-2">
              <div
                className={`flex-1 min-w-0  ${!hasIntegration ? "pointer-events-none opacity-50" : ""}`}
              >
                <Combobox
                  onValueChange={handleSearchRepos}
                  placeholder="Search repository..."
                  items={repositories ?? []}
                  loading={isLoadingRepositories}
                  onSelect={(repoId: string) => {
                    const repo = repositories?.find((r) => r.value === repoId);
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
                    variant="secondary"
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          }
          Description={
            "Select a repository to connect this repository to. This will enable to open and handle issues in the target repository. The list contains all repositories of all GitHub App, Gitlab and Jira integrations in this organization."
          }
        />
      </div>
      <div className="mt-10 flex flex-row gap-2 justify-end">
        <Button onClick={() => api?.scrollTo(prevIndex)} variant={"secondary"}>
          Back
        </Button>
        <Button
          disabled={!asset.repositoryId}
          onClick={() => api?.scrollTo(afterSuccessfulConnectionSlideIndex)}
        >
          Continue
        </Button>
      </div>
    </CarouselItem>
  );
}
