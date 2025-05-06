import Page from "@/components/Page";
import AssetForm, { AssetFormValues } from "@/components/asset/AssetForm";
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
import { isNumber } from "@/utils/common";
import { useStore } from "@/zustand/globalStoreProvider";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import ConnectToRepoSection from "../../../../../../components/ConnectToRepoSection";
import Alert from "../../../../../../components/common/Alert";
import DangerZone from "../../../../../../components/common/DangerZone";
import ListItem from "../../../../../../components/common/ListItem";
import Section from "../../../../../../components/common/Section";
import { getParentRepositoryIdAndName } from "../../../../../../utils/view";
import { Input } from "@/components/ui/input";
import { set } from "lodash";
import { Label } from "@/components/ui/label";
import { config } from "@/config";
interface Props {
  repositories: Array<{ value: string; label: string }> | null; // will be null, if repos could not be loaded - probably due to a missing github app installation
  secrets: {
    badgeSecret: string;
    webhookSecret: string;
  };
  apiBadgeUrl: string;
}

import Image from "next/image";

const firstOrUndefined = (el?: number[]): number | undefined => {
  if (!el) {
    return undefined;
  }
  return el[0];
};

type SecretType = "badge" | "webhook";

const Index: FunctionComponent<Props> = ({
  repositories,
  secrets,
  apiBadgeUrl,
}) => {
  const activeOrg = useActiveOrg();
  const assetMenu = useAssetMenu();
  const project = useActiveProject();
  const asset = useActiveAsset()!;
  const updateAsset = useStore((s) => s.updateAsset);
  const router = useRouter();

  const [badgeSecret, setBadgeSecret] = useState<string>(secrets.badgeSecret);
  const [webhookSecret, setWebhookSecret] = useState<string | null>(
    secrets.webhookSecret,
  );

  const [badgeURL, setBadgeURL] = useState<string>(apiBadgeUrl + badgeSecret);

  const form = useForm<AssetFormValues>({
    defaultValues: {
      ...asset,

      cvssAutomaticTicketThreshold: isNumber(asset.cvssAutomaticTicketThreshold)
        ? [asset.cvssAutomaticTicketThreshold]
        : [],
      riskAutomaticTicketThreshold: isNumber(asset.riskAutomaticTicketThreshold)
        ? [asset.riskAutomaticTicketThreshold]
        : [],
      enableTicketRange: Boolean(
        isNumber(asset.riskAutomaticTicketThreshold) ||
          isNumber(asset.cvssAutomaticTicketThreshold),
      ),
    },
  });

  const handleGenerateNewSecret = async (type: SecretType) => {
    let bodyKey: string;
    if (type === "badge") {
      bodyKey = "badgeSecretUpdate";
    } else {
      bodyKey = "webhookSecretUpdate";
    }

    const resp = await browserApiClient(
      `/organizations/${activeOrg.slug}/projects/${project!.slug}/assets/${asset.slug}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          [bodyKey]: true,
        }),
      },
    );

    if (resp.ok) {
      const r = await resp.json();

      if (type === "badge") {
        setBadgeSecret(r.badgeSecret);
        setBadgeURL(`${config.devGuardApiUrl}/api/v1/badges/${r.badgeSecret}`);
        asset.badgeSecret = r.badgeSecret;
        toast("New badge secret generated", {
          description: "The badge secret has been generated",
        });
      } else if (type === "webhook") {
        setWebhookSecret(r.webhookSecret);
        asset.webhookSecret = r.webhookSecret;
        toast("New webhook secret generated", {
          description: "The webhook secret has been generated",
        });
      }

      updateAsset(asset);
    } else {
      toast.error("Could not generate new secret");
    }
  };

  const handleDeleteAsset = async () => {
    const resp = await browserApiClient(
      "/organizations/" +
        activeOrg.slug +
        "/projects/" +
        project!.slug + // can never be null
        "/assets/" +
        asset.slug,
      {
        method: "DELETE",
      },
    );
    if (resp.ok) {
      toast("Asset deleted", {
        description: "The asset has been deleted",
      });
      router.push("/" + activeOrg.slug + "/projects/" + project!.slug);
    } else {
      toast.error("Could not delete asset");
    }
  };

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
            <AssetForm
              form={form}
              showReportingRange={asset.repositoryId !== null}
            />
            <div className="mt-4 flex flex-row justify-end">
              <Button>Update</Button>
            </div>
          </form>
        </Form>
      </div>
      <div>
        <Section title="Secrets Management" description="Secrets management">
          <div>
            <div className="flex flex-col items-stretch gap-2">
              <Label>Badge Secret</Label>
              <div className="flex flex-row items-start justify-between">
                <Input value={badgeSecret} />

                <Button
                  variant="secondary"
                  onClick={() => handleGenerateNewSecret("badge")}
                >
                  <div className="h-4 w-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                  </div>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                This secret is used to authenticate the badge requests.
              </p>
            </div>
            {asset.lastScaScan || asset.lastContainerScan ? (
              <div className="space-y-2 p-4 border rounded-xl bg-muted mt-1">
                <p className="text-sm text-muted-foreground">
                  You can use the following URL to display this badge in your
                  README or other documentation:
                </p>
                <code className="block text-sm bg-background p-2 rounded-md overflow-x-auto">
                  {badgeURL}
                </code>

                <img
                  src={badgeURL}
                  alt="CVSS Badge"
                  className="mt-2 rounded-md shadow-sm hover:shadow-md transition-shadow"
                />
              </div>
            ) : (
              <div className="space-y-2 p-4 border rounded-xl bg-muted mt-1">
                <p className="text-sm text-muted-foreground">
                  No dependencies scans have been performed yet. The badge will
                  be displayed here once a scan has been performed.
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-stretch gap-2 pt-4">
            <Label>Webhook Secret</Label>
            <div className="flex flex-row items-start justify-between">
              <Input value={webhookSecret ?? "No webhook secret set"} />

              <Button
                variant="secondary"
                onClick={() => handleGenerateNewSecret("webhook")}
              >
                <div className="h-4 w-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                </div>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This secret is used to authenticate the webhook requests.
            </p>
          </div>
        </Section>
        <hr />
      </div>
      <DangerZone>
        <Section
          className="m-2"
          title="Advanced"
          description="These settings are for advanced users only. Please be careful when changing these settings."
        >
          <ListItem
            Title="Delete Asset"
            Description={
              "This will delete the asset and all of its data. This action cannot be undone."
            }
            Button={
              <Alert
                title="Are you sure to delete this asset?"
                description="This action cannot be undone. All data associated with this asset will be deleted."
                onConfirm={handleDeleteAsset}
              >
                <Button variant={"destructive"}>Delete</Button>
              </Alert>
            }
          />
        </Section>
      </DangerZone>
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

    const [resp, repoResp, secretsResp] = await Promise.all([
      apiClient(uri),
      apiClient(
        "/organizations/" + organizationSlug + "/integrations/repositories",
      ),
      apiClient(
        "/organizations/" +
          organizationSlug +
          "/projects/" +
          projectSlug +
          "/assets/" +
          assetSlug +
          "/secrets",
      ),
    ]);

    let repos: Array<{ value: string; label: string }> | null = null;
    if (repoResp.ok) {
      repos = convertRepos(await repoResp.json());
    }

    // fetch a personal access token from the user
    const [asset] = await Promise.all([resp.json()]);

    const secrets = await secretsResp.json();

    const apiBadgeUrl = config.devGuardApiUrl + "/api/v1/badges/";

    return {
      props: {
        asset,
        repositories: repos,
        secrets,
        apiBadgeUrl,
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
