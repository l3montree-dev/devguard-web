import { Badge } from "@/components/ui/badge";
import { CarouselItem } from "@/components/ui/carousel";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OrganizationDetailsDTO } from "@/types/api/api";
import { ExternalTicketProvider } from "@/types/common";
import ListItem from "@/components/common/ListItem";
import { Combobox } from "@/components/common/Combobox";
import { Button } from "@/components/ui/button";
import useRepositorySearch from "@/hooks/useRepositorySearch";
import { useState } from "react";
import { browserApiClient } from "@/services/devGuardApi";
import { AssetFormValues } from "@/components/asset/AssetForm";
import { useActiveProject } from "@/hooks/useActiveProject";
import { toast } from "sonner";
import { useActiveAsset } from "@/hooks/useActiveAsset";

interface StartSlideProps {
  api?: {
    scrollNext: () => void;
    scrollPrev: () => void;
    scrollTo: (index: number) => void;
  };
  activeOrg: OrganizationDetailsDTO;
  repositories: Array<{ value: string; label: string }> | null;
  repositoryName?: string;
  repositoryId?: string;
}

export default function SelectRepoSlide({
  repositories,
  repositoryName,
  repositoryId,
  activeOrg,
  api,
}: StartSlideProps) {
  const hasIntegration =
    activeOrg.gitLabIntegrations.length > 0 ||
    activeOrg.githubAppInstallations.length > 0 ||
    activeOrg.jiraIntegrations.length > 0;

  const [editRepo, setEditRepo] = useState(!Boolean(repositoryId));

  const { repos, searchLoading, handleSearchRepos } =
    useRepositorySearch(repositories);

  const [selectedRepo, setSelectedRepo] = useState<{
    id: string;
    name: string;
  } | null>(repositoryId ? { id: repositoryId!, name: repositoryName! } : null);

  const [repoSelectedAndSet, setRepoSelectedAndSet] = useState(
    Boolean(repositoryId) && Boolean(repositoryName),
  );

  const asset = useActiveAsset()!;
  const project = useActiveProject();

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
      toast.success("Repository connected successfully.");
    }
  };

  console.log("Selected Repository:", selectedRepo);

  console.log("repoSelectedAndSet:", repoSelectedAndSet);

  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>
          <Badge className="mr-2" variant="secondary">
            Step 2/3
          </Badge>{" "}
          Select your Repository to connect with DevGuard
        </DialogTitle>
        <hr className="my-4" />
      </DialogHeader>
      <div className="p-1">
        <ListItem
          Title={
            <div className="flex flex-row gap-2">
              <div
                className={`flex-1  ${!hasIntegration ? "pointer-events-none opacity-50" : ""}`}
              >
                <Combobox
                  onValueChange={handleSearchRepos}
                  placeholder="Search repository..."
                  items={repos}
                  loading={searchLoading}
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
                  variant={hasIntegration ? "default" : "secondary"}
                >
                  Connect
                </Button>
              )}
            </div>
          }
          Description={
            "Select a repository to connect this repository to. This will enable to open and handle issues in the target repository. The list contains all repositories of all GitHub App, Gitlab and Jira integrations in this organization."
          }
        />
      </div>
      <div className="mt-10 flex flex-row gap-2 justify-end">
        <Button onClick={() => api?.scrollTo(0)} variant={"secondary"}>
          Back
        </Button>
        <Button
          disabled={!Boolean(selectedRepo) || !hasIntegration}
          onClick={() => api?.scrollNext()}
        >
          Continue
        </Button>
      </div>
    </CarouselItem>
  );
}
