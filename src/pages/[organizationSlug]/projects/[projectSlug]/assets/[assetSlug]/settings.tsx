import Page from "@/components/Page";
import AssetForm from "@/components/asset/AssetForm";
import { Combobox } from "@/components/common/Combobox";
import ListItem from "@/components/common/ListItem";
import Section from "@/components/common/Section";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrganization } from "@/decorators/withOrganization";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { cn } from "@/lib/utils";
import {
  browserApiClient,
  getApiClientFromContext,
} from "@/services/devGuardApi";
import { AssetDTO } from "@/types/api/api";
import { useStore } from "@/zustand/globalStoreProvider";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { FunctionComponent, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Image from "next/image";
import { debounce } from "lodash";

interface Props {
  repositories: Array<{ value: string; label: string }> | null; // will be null, if repos could not be loaded - probably due to a missing github app installation
}

const Index: FunctionComponent<Props> = ({ repositories }: Props) => {
  const activeOrg = useActiveOrg();
  const assetMenu = useAssetMenu();
  const project = useActiveProject();
  const asset = useActiveAsset()!;
  const updateAsset = useStore((s) => s.updateAsset);
  const router = useRouter();
  const form = useForm<AssetDTO>({ defaultValues: asset });
  const [selectedRepo, setSelectedRepo] = useState<{
    id: string;
    name: string;
  } | null>(
    asset.repositoryId
      ? { id: asset.repositoryId!, name: asset.repositoryName! }
      : null,
  );

  const [repos, setRepositories] = useState(repositories ?? []);
  const [searchLoading, setSearchLoading] = useState(false);

  const [editRepo, setEditRepo] = useState(!Boolean(asset.repositoryId));

  const handleUpdate = async (data: Partial<AssetDTO>) => {
    const resp = await browserApiClient(
      "/organizations/" +
        activeOrg.slug +
        "/projects/" +
        project!.slug + // can never be null
        "/assets/" +
        asset.slug,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    if (!resp.ok) {
      console.error("Could not update asset");
    }

    // check if the slug changed - if so, redirect to the new slug
    const newAsset = await resp.json();
    updateAsset(newAsset);
    if (newAsset.slug !== asset.slug) {
      router.push(
        "/" +
          activeOrg.slug +
          "/projects/" +
          project!.slug + // can never be null
          "/assets/" +
          newAsset.slug +
          "/settings",
      );
    }
    toast("Success", {
      description: "Asset updated",
    });
  };

  const debouncedSearch = useCallback(
    debounce(async (search: string) => {
      setSearchLoading(true);
      // fetch repositories from the server
      const repos = await browserApiClient(
        "/organizations/" +
          activeOrg.slug +
          "/integrations/repositories?search=" +
          search,
      );

      const data = await repos.json();
      setRepositories(convertRepos(data) ?? []);
      setSearchLoading(false);
    }, 500),
    [activeOrg.slug],
  );

  const handleSearchRepos = async (value: string) => {
    if (value === "") {
      setRepositories(repositories ?? []);
      return;
    }
    return debouncedSearch(value);
  };

  return (
    <Page
      Menu={assetMenu}
      title="Asset Settings"
      description="Update the settings of this asset"
      Title={
        <span className="flex flex-row gap-2">
          <Link
            href={`/${activeOrg.slug}`}
            className="flex flex-row items-center gap-1 !text-white hover:no-underline"
          >
            {activeOrg.name}{" "}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Organization
            </Badge>
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="flex flex-row items-center gap-1 !text-white hover:no-underline"
            href={`/${activeOrg.slug}/projects/${project?.slug}`}
          >
            {project?.name}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Project
            </Badge>
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="flex items-center gap-1 text-white hover:no-underline"
            href={`/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}`}
          >
            {asset?.name}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Asset
            </Badge>
          </Link>
        </span>
      }
    >
      <div>
        <div className="flex flex-row justify-between">
          <h1 className="text-2xl font-semibold">Asset Settings</h1>
        </div>
        <Section
          title="Connect to a repository"
          description="Connect this asset to a repository to enable automatic scanning and other features."
        >
          {Boolean(asset.repositoryId) && repositories && !editRepo ? (
            <div>
              <ListItem
                Title={
                  <>
                    <span className="relative mr-2 inline-flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                    </span>

                    {asset.repositoryName}
                  </>
                }
                description={"This asset is connected to a GitHub repository "}
                Button={
                  <>
                    <Button
                      variant={"destructiveOutline"}
                      onClick={async () => {
                        await handleUpdate({ repositoryId: "" });
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
                        await handleUpdate({
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
      </div>
      <hr />
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdate)}>
            <AssetForm form={form} />
            <div className="mt-4 flex flex-row justify-end">
              <Button>Update</Button>
            </div>
          </form>
        </Form>
      </div>
    </Page>
  );
};
export default Index;

const convertRepos = (repos: Array<{ label: string; id: string }>) =>
  repos.map((r) => ({ value: r.id, label: r.label }));

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext) => {
    // fetch the project
    const { organizationSlug, projectSlug, assetSlug } = context.params!;

    const apiClient = getApiClientFromContext(context);
    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/";

    const [resp, repoResp] = await Promise.all([
      apiClient(uri),
      apiClient(
        "/organizations/" + organizationSlug + "/integrations/repositories",
      ),
    ]);

    let repos: Array<{ value: string; label: string }> | null = null;
    if (repoResp.ok) {
      repos = convertRepos(await repoResp.json());
    }

    // fetch a personal access token from the user
    const [asset] = await Promise.all([resp.json()]);

    return {
      props: {
        asset,
        repositories: repos,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    project: withProject,
    asset: withAsset,
  },
);
