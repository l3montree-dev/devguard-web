import Page from "@/components/Page";
import AssetForm, {
  AssetFormValues,
  EnableTicketRange,
} from "@/components/asset/AssetForm";
import AssetTitle from "@/components/common/AssetTitle";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withContentTree } from "@/decorators/withContentTree";
import { withOrganization } from "@/decorators/withOrganization";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useRepositorySearch, { convertRepos } from "@/hooks/useRepositorySearch";
import {
  browserApiClient,
  getApiClientFromContext,
} from "@/services/devGuardApi";
import { AssetDTO } from "@/types/api/api";
import { useStore } from "@/zustand/globalStoreProvider";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import ConnectToRepoSection from "../../../../../../components/ConnectToRepoSection";
import { getParentRepositoryIdAndName } from "../../../../../../utils/view";

interface Props {
  repositories: Array<{ value: string; label: string }> | null; // will be null, if repos could not be loaded - probably due to a missing github app installation
}

const firstOrUndefined = (el?: number[]): number | undefined => {
  if (!el) {
    return undefined;
  }

  return el[0];
};
const Index: FunctionComponent<Props> = ({ repositories }: Props) => {
  const activeOrg = useActiveOrg();
  const assetMenu = useAssetMenu();
  const project = useActiveProject();
  const asset = useActiveAsset()!;
  const updateAsset = useStore((s) => s.updateAsset);
  const router = useRouter();

  const form = useForm<AssetFormValues>({
    defaultValues: {
      ...asset,

      cvssAutomaticTicketThreshold: asset.cvssAutomaticTicketThreshold
        ? [asset.cvssAutomaticTicketThreshold]
        : [],
      riskAutomaticTicketThreshold: asset.riskAutomaticTicketThreshold
        ? [asset.riskAutomaticTicketThreshold]
        : [],
      enableTicketRange: Boolean(
        asset.riskAutomaticTicketThreshold ||
          asset.cvssAutomaticTicketThreshold,
      ),
    },
  });

  const handleUpdate = async (data: Partial<AssetFormValues>) => {
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
          cvssAutomaticTicketThreshold: firstOrUndefined(
            data.cvssAutomaticTicketThreshold,
          ),
          riskAutomaticTicketThreshold: firstOrUndefined(
            data.riskAutomaticTicketThreshold,
          ),
          enableTicketRange: asset.enableTicketRange,
        }),
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

  const { repos, searchLoading, handleSearchRepos } =
    useRepositorySearch(repositories);

  const { parentRepositoryId, parentRepositoryName } =
    getParentRepositoryIdAndName(project);

  return (
    <Page
      Menu={assetMenu}
      title="Asset Settings"
      description="Update the settings of this asset"
      Title={<AssetTitle />}
    >
      <div>
        <div className="flex flex-row justify-between">
          <h1 className="text-2xl font-semibold">Asset Settings</h1>
        </div>
        <ConnectToRepoSection
          parentRepositoryId={parentRepositoryId}
          parentRepositoryName={parentRepositoryName}
          repositoryName={asset.repositoryName}
          repositoryId={asset.repositoryId}
          repositories={repos}
          onUpdate={handleUpdate}
        />
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
    contentTree: withContentTree,
  },
);
