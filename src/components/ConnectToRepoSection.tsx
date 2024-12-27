import React, { FunctionComponent, useState } from "react";
import Section from "./common/Section";
import ListItem from "./common/ListItem";
import { Button, buttonVariants } from "./ui/button";
import { Combobox } from "./common/Combobox";
import useRepositorySearch from "../hooks/useRepositorySearch";
import Image from "next/image";
import { useActiveOrg } from "../hooks/useActiveOrg";
import Link from "next/link";
import { cn } from "../lib/utils";

interface Props {
  repositoryName?: string;
  repositoryId?: string;
  repositories: Array<{ value: string; label: string }> | null; // will be null, if repos could not be loaded - probably due to a missing github app installation
  onUpdate: (
    data: Partial<{ repositoryName: string; repositoryId: string }>,
  ) => Promise<void>;
}
const ConnectToRepoSection: FunctionComponent<Props> = ({
  repositoryName,
  repositoryId,
  repositories,
  onUpdate,
}) => {
  const activeOrg = useActiveOrg();
  const { repos, searchLoading, handleSearchRepos } =
    useRepositorySearch(repositories);
  const [editRepo, setEditRepo] = useState(!Boolean(repositoryId));

  const [selectedRepo, setSelectedRepo] = useState<{
    id: string;
    name: string;
  } | null>(repositoryId ? { id: repositoryId!, name: repositoryName! } : null);

  return (
    <Section
      title="Connect to a repository"
      description="Connect this asset to a repository to enable automatic scanning and other features."
    >
      {Boolean(repositoryId) && repositories && !editRepo ? (
        <div>
          <ListItem
            Title={
              <>
                <span className="relative mr-2 inline-flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                </span>

                {repositoryName}
              </>
            }
            description={
              "This asset is connected to a " +
              (repositoryId?.startsWith("github:") ? "GitHub" : "GitLab") +
              " repository "
            }
            Button={
              <>
                <Button
                  variant={"destructiveOutline"}
                  onClick={async () => {
                    await onUpdate({ repositoryId: "" });
                    setEditRepo(true);
                  }}
                >
                  Remove connection
                </Button>
                <Button
                  variant={"secondary"}
                  onClick={() => {
                    setEditRepo(true);
                  }}
                >
                  Change
                </Button>
              </>
            }
          />
        </div>
      ) : repositories && editRepo ? (
        <ListItem
          Title={
            <div className="flex flex-row gap-2">
              <div className="flex-1">
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
              <Button
                onClick={async () => {
                  if (selectedRepo) {
                    await onUpdate({
                      repositoryId: selectedRepo.id,
                      repositoryName: selectedRepo.name,
                    });
                    setEditRepo(false);
                  }
                }}
                disabled={!Boolean(selectedRepo)}
              >
                Connect
              </Button>
            </div>
          }
          description={
            "Select a repository to connect this asset to. This list contains all repositories of all GitHub App Installations belonging to this organization."
          }
        />
      ) : (
        <>
          <ListItem
            Title={
              <div className="flex flex-row items-center">
                <Image
                  src="/assets/github.svg"
                  alt="GitHub"
                  width={20}
                  height={20}
                  className="mr-2 inline-block dark:invert"
                />
                Add a GitHub App
              </div>
            }
            description="DevGuard uses a GitHub App to access your repositories and interact with your code. Due to the excessive permissions granted to the app, it can only be done by the organization owner."
            Button={
              <Link
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "hover:no-underline",
                )}
                href={"/" + activeOrg.slug + "/settings"}
              >
                Go to organization settings
              </Link>
            }
          />
          <ListItem
            Title={
              <div className="flex flex-row items-center">
                <Image
                  src="/assets/gitlab.svg"
                  alt="GitHub"
                  width={20}
                  height={20}
                  className="mr-2 inline-block"
                />
                Integrate with GitLab
              </div>
            }
            description="DevGuard uses a personal, group or project access token to access your repositories and interact with your code. Due to the excessive permissions granted to the app, it can only be done by the organization owner."
            Button={
              <Link
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "hover:no-underline",
                )}
                href={"/" + activeOrg.slug + "/settings"}
              >
                Go to organization settings
              </Link>
            }
          />
        </>
      )}
    </Section>
  );
};

export default ConnectToRepoSection;
