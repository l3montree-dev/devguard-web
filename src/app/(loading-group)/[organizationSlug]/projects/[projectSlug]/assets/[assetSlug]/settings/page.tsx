"use client";
import Page from "@/components/Page";
import AssetForm, { AssetFormValues } from "@/components/asset/AssetForm";
import AssetTitle from "@/components/common/AssetTitle";
import { AsyncButton, Button } from "@/components/ui/button";
import { InputWithButton } from "@/components/ui/input-with-button";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { convertRepos } from "@/hooks/useRepositorySearch";
import { browserApiClient } from "@/services/devGuardApi";
import { isNumber } from "@/utils/common";
import { useRouter } from "next/navigation";
import { FunctionComponent, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import ConnectToRepoSection from "../../../../../../../../components/ConnectToRepoSection";
import Alert from "../../../../../../../../components/common/Alert";
import DangerZone from "../../../../../../../../components/common/DangerZone";
import ListItem from "../../../../../../../../components/common/ListItem";
import Section from "../../../../../../../../components/common/Section";
import { useUpdateAsset } from "../../../../../../../../context/AssetContext";
import { useConfig } from "../../../../../../../../context/ConfigContext";
import { fetcher } from "../../../../../../../../data-fetcher/fetcher";
import useDecodedParams from "../../../../../../../../hooks/useDecodedParams";
import { AssetDTO } from "../../../../../../../../types/api/api";
import {
  generateNewSecret,
  getParentRepositoryIdAndName,
} from "../../../../../../../../utils/view";

const firstOrUndefined = (el?: number[]): number | undefined => {
  if (!el) {
    return undefined;
  }
  return el[0];
};

type SecretType = "badge" | "webhook";

const Index: FunctionComponent = () => {
  const activeOrg = useActiveOrg();
  const assetMenu = useAssetMenu();
  const project = useActiveProject()!;
  const asset = useActiveAsset()!;
  const updateAsset = useUpdateAsset();
  const router = useRouter();
  const config = useConfig();

  // fetch the project
  const { organizationSlug, projectSlug, assetSlug } = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
  };

  const { data: secrets, mutate: mutateSecrets } = useSWR<{
    badgeSecret: string;
    webhookSecret: string;
  }>(
    "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/secrets",
    fetcher,
  );

  const { data: repoResp } = useSWR<any[]>(
    "/organizations/" + organizationSlug + "/integrations/repositories",
    fetcher,
  );

  const repositories = useMemo(() => {
    return convertRepos(repoResp || []);
  }, [repoResp]);

  const apiBadgeUrl = config.devguardApiUrlPublicInternet + "/api/v1/badges/";

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
    const secret = generateNewSecret();

    mutateSecrets(
      async (prev) => {
        const resp = await browserApiClient(
          `/organizations/${activeOrg.slug}/projects/${project!.slug}/assets/${asset.slug}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              [bodyKey]: secret,
            }),
          },
        );

        const r = (await resp.json()) as AssetDTO;

        updateAsset(r);
        return {
          ...prev,
          [bodyKey]: r[bodyKey as "badgeSecret" | "webhookSecret"],
        } as {
          badgeSecret: string;
          webhookSecret: string;
        };
      },
      {
        optimisticData(currentData) {
          return {
            ...currentData,
            [bodyKey]: secret,
          } as {
            badgeSecret: string;
            webhookSecret: string;
          };
        },
        revalidate: false,
      },
    );
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
          vulnAutoReopenAfterDays: data.vulnAutoReopenAfterDays
            ? +data.vulnAutoReopenAfterDays
            : undefined,
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
            repositories={repositories}
            onUpdate={handleUpdate}
          />
        )}
      </div>
      <hr />
      <div>
        <FormProvider {...form}>
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
              <AsyncButton
                type="button"
                onClick={async () => {
                  return await form.handleSubmit(handleUpdate)();
                }}
              >
                Update
              </AsyncButton>
            </div>
          </form>
        </FormProvider>
      </div>
      <div>
        <Section
          title="Badge Management"
          description="The provided URL can be used to display the CVSS badge in your README or other documentation."
        >
          <div className="space-y-2 p-4 border rounded-xl bg-muted mt-1">
            <InputWithButton
              label="Badge Secret"
              value={apiBadgeUrl + "cvss/" + secrets?.badgeSecret}
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
              src={apiBadgeUrl + "cvss/" + secrets?.badgeSecret}
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
              value={`${config.devguardApiUrlPublicInternet}/api/v1/webhook/`}
              message="You can use the URL to send webhook requests to this endpoint."
              copyable
            />

            <InputWithButton
              label="Webhook Secret"
              value={secrets?.webhookSecret ?? "No webhook secret set"}
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
