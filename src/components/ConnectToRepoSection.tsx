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
import Callout from "./common/Callout";
import { useRouter } from "next/router";

interface Props {
  parentRepositoryId?: string;
  parentRepositoryName?: string;
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
  parentRepositoryId,
  parentRepositoryName,
}) => {
  const activeOrg = useActiveOrg();
  const router = useRouter();

  const hasIntegration =
    activeOrg.gitLabIntegrations.length > 0 ||
    activeOrg.githubAppInstallations.length > 0 ||
    activeOrg.jiraIntegrations.length > 0;

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
      description="Connect this repository to a repository to enable automatic scanning and other features."
    >
      {Boolean(parentRepositoryId) && (
        <div>
          <ListItem
            Title={
              <>
                <span className="relative mr-2 inline-flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                </span>
                repository
                {parentRepositoryName}
              </>
            }
            Description={
              "This repository is connected to a " +
              (repositoryId?.startsWith("github:") ? "GitHub" : "GitLab") +
              " repository "
            }
            Button={
              <>
                <Button
                  variant={"destructive"}
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
      )}
      {parentRepositoryId && (
        <>
          <hr />
          <Callout intent="info">
            The parent project is already connected to a repository. You can
            override this connection by connecting this repository to a
            different repository.
          </Callout>
        </>
      )}
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
            Description={
              "This repository is connected to a " +
              (repositoryId?.startsWith("github:") ? "GitHub" : "GitLab") +
              " repository "
            }
            Button={
              <>
                <Button
                  variant={"destructive"}
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
        <div>
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
                  disabled={!Boolean(selectedRepo) || !hasIntegration}
                  variant={hasIntegration ? "default" : "secondary"}
                >
                  Connect
                </Button>
              </div>
            }
            Description={
              "Select a repository to connect this repository to. This will enable to open and handle issues in the target repository. The list contains all repositories of all GitHub App, Gitlab and Jira integrations in this organization."
            }
          />
          {!hasIntegration && (
            <div>
              <Callout intent="warning">
                You need to install the DevGuard GitHub App, a GitLab, or a Jira
                integration in the organization settings to connect a
                repository.
              </Callout>
              <div className="flex flex-row justify-end">
                <Button
                  variant="default"
                  className="mt-2"
                  onClick={() => {
                    setEditRepo(false);
                    router.replace(`/${activeOrg.slug}/settings`);
                  }}
                >
                  Organization Settings
                </Button>
              </div>
            </div>
          )}
        </div>
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
            Description="DevGuard uses a GitHub App to access your repositories and interact with your code. Due to the excessive permissions granted to the app, it can only be done by the organization owner."
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
                Integrate with GitLab/ openCode
              </div>
            }
            Description="DevGuard uses a personal, group or project access token to access your repositories and interact with your code. Due to the excessive permissions granted to the app, it can only be done by the organization owner."
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
