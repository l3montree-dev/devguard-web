import Page from "@/components/Page";
import AssetForm, { AssetFormValues } from "@/components/asset/AssetForm";
import AssetTitle from "@/components/common/AssetTitle";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { config } from "@/config";
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
interface Props {
  repositories: Array<{ value: string; label: string }> | null; // will be null, if repos could not be loaded - probably due to a missing github app installation
  secrets: {
    badgeSecret: string;
    webhookSecret: string;
  };
  apiPublicUrl: string;
}

import { InputWithButton } from "@/components/ui/input-with-button";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useCurrentUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/types/api/api";

const firstOrUndefined = (el?: number[]): number | undefined => {
  if (!el) {
    return undefined;
  }
  return el[0];
};

type SecretType = "badge" | "webhook";

export const generateNewSecret = (): string => {
  return crypto.randomUUID();
};

const Index: FunctionComponent<Props> = ({
  repositories,
  secrets,
  apiPublicUrl,
}) => {
  const activeOrg = useActiveOrg();
  const assetMenu = useAssetMenu();
  const project = useActiveProject();
  const asset = useActiveAsset()!;
  const updateAsset = useStore((s) => s.updateAsset);
  const router = useRouter();

  const [badgeSecret, setBadgeSecret] = useState<string>(secrets.badgeSecret);
  const [webhookSecret, setWebhookSecret] = useState<string>(
    secrets.webhookSecret,
  );

  const apiBadgeUrl = apiPublicUrl + "/api/v1/badges/";

  const [badgeURL, setBadgeURL] = useState<string>(
    apiBadgeUrl + "cvss/" + badgeSecret,
  );

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
      bodyKey = "badgeSecret";
    } else {
      bodyKey = "webhookSecret";
    }

    const resp = await browserApiClient(
      `/organizations/${activeOrg.slug}/projects/${project!.slug}/assets/${asset.slug}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          [bodyKey]: generateNewSecret(),
        }),
      },
    );

    if (resp.ok) {
      const r = await resp.json();

      if (type === "badge") {
        setBadgeSecret(r.badgeSecret);
        setBadgeURL(`${apiBadgeUrl}cvss/${r.badgeSecret}`);
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
      toast("Repository deleted", {
        description: "The asset has been deleted",
      });
      router.push("/" + activeOrg.slug + "/projects/" + project!.slug);
    } else {
      toast.error("Could not delete repository");
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
      title="Repository Settings"
      description="Update the settings of this repository"
      Title={<AssetTitle />}
    >
      <div>
        <div className="flex flex-row justify-between">
          <h1 className="text-2xl font-semibold">Repository Settings</h1>
        </div>
        {!asset.externalEntityProviderId && (
          <ConnectToRepoSection
            parentRepositoryId={parentRepositoryId}
            parentRepositoryName={parentRepositoryName}
            repositoryName={asset.repositoryName}
            repositoryId={asset.repositoryId}
            repositories={repos}
            onUpdate={handleUpdate}
          />
        )}
      </div>
      <hr />
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdate)}>
            <AssetForm
              disable={Boolean(asset.externalEntityProviderId)}
              form={form}
              showReportingRange={
                asset.repositoryId !== null ||
                Boolean(asset.externalEntityProviderId)
              }
            />
            <div className="mt-4 flex flex-row justify-end">
              <Button>Update</Button>
            </div>
          </form>
        </Form>
      </div>
      <div>
        <Section
          title="Badge Management"
          description="The provided URL can be used to display the CVSS badge in your README or other documentation."
        >
          <div className="space-y-2 p-4 border rounded-xl bg-muted mt-1">
            <InputWithButton
              label="Badge Secret"
              value={badgeURL}
              message="You can use the URL to display this badge in your README or other documentation.
              The CVSS values in the badge are automatically updated based on the latest vulnerabilities in the default branch of the repository."
              copyable
              update={{
                update: () => handleGenerateNewSecret("badge"),
                updateConfirmTitle:
                  "Are you sure to generate a new badge secret?",
                updateConfirmDescription:
                  "This will generate a new badge secret. The badge URL will change and you need to update the badge URL in your documentation.",
              }}
            />
            <img
              src={badgeURL}
              alt="CVSS Badge"
              className="mt-2 rounded-md shadow-sm hover:shadow-md transition-shadow"
            />
          </div>
        </Section>

        <Section
          title="Webhook Management"
          description="Provides a webhook URL and secret for this repository."
        >
          <div className="space-y-2 p-4 border rounded-xl bg-muted mt-1">
            <InputWithButton
              label="Webhook URL"
              value={`${apiPublicUrl}/api/v1/webhook/`}
              message="You can use the URL to send webhook requests to this endpoint."
              copyable
            />

            <InputWithButton
              label="Webhook Secret"
              value={webhookSecret ?? "No webhook secret set"}
              message="This secret is used to authenticate the webhook requests. You need to set this secret in your webhook configuration."
              copyable
              update={{
                update: () => handleGenerateNewSecret("webhook"),
                updateConfirmTitle:
                  "Are you sure to generate a new webhook secret?",
                updateConfirmDescription:
                  "This will generate a new webhook secret. All existing webhook configurations will need to be updated with the new secret.",
              }}
            />
          </div>
        </Section>
        <hr />
      </div>
      {!asset.externalEntityProviderId && (
        <DangerZone>
          <Section
            className="m-2"
            title="Advanced"
            description="These settings are for advanced users only. Please be careful when changing these settings."
          >
            <ListItem
              Title="Delete Repository"
              Description={
                "This will delete the repository and all of its data. This action cannot be undone."
              }
              Button={
                <Alert
                  title="Are you sure to delete this repository?"
                  description="This action cannot be undone. All data associated with this repository will be deleted."
                  onConfirm={handleDeleteAsset}
                >
                  <Button variant={"destructive"}>Delete</Button>
                </Alert>
              }
            />
          </Section>
        </DangerZone>
      )}
    </Page>
  );
};
export default Index;

export const getServerSideProps = middleware(
  async (
    context: GetServerSidePropsContext,
    { organization, session, project },
  ) => {
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

    return {
      props: {
        asset,
        repositories: repos,
        secrets,
        apiPublicUrl: config.devguardApiUrlPublicInternet,
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
