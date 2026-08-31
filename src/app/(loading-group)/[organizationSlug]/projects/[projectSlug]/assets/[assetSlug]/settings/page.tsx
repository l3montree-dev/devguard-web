// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";
import AccessTokenManagement from "@/components/AccessTokenManagement";
import Page from "@/components/Page";
import AssetForm from "@/components/asset/AssetForm";
import type { AssetFormValues, SecretType } from "@/types/view/asset";
import AssetTitle from "@/components/common/AssetTitle";
import Section from "@/components/common/Section";
import { repoSettingsTourSteps } from "@/components/common/tours/repoSettingsTour";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputWithButton } from "@/components/ui/input-with-button";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { useAutoTour } from "@/hooks/useAutoTour";
import { convertRepos } from "@/hooks/useRepositorySearch";
import { toast } from "@/lib/toast";
import {
  changeAssetMemberRole,
  deleteAsset,
  patchAsset,
  removeAssetMember,
  triggerAssetPipeline,
} from "@/services/assetService";
import { classNames, isNumber } from "@/utils/common";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FunctionComponent } from "react";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Alert from "../../../../../../../../components/common/Alert";
import DangerZone from "../../../../../../../../components/common/DangerZone";
import ListItem from "../../../../../../../../components/common/ListItem";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../../../../../../components/ui/collapsible";
import { Switch } from "../../../../../../../../components/ui/switch";
import { useUpdateAsset } from "../../../../../../../../context/AssetContext";
import { useConfig } from "../../../../../../../../context/ConfigContext";
import useDecodedParams from "../../../../../../../../hooks/useDecodedParams";
import type { AssetDetailsWithSecretsDTO } from "@/types/dto";
import type { components } from "@/types/api/generated";
import { useAssetSecrets } from "@/hooks/useAssetSecrets";
import { useIntegrationRepositories } from "@/hooks/useIntegrationRepositories";
import { UserRole } from "@/types/view/vuln";
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

  const { data: secrets, mutate: mutateSecrets } = useAssetSecrets({
    organization: organizationSlug,
    projectSlug,
    assetSlug,
  });

  const url =
    "/organizations/" +
    organizationSlug +
    "/projects/" +
    projectSlug +
    "/assets/" +
    assetSlug +
    "/pats/";

  const { repositories: repoResp } =
    useIntegrationRepositories(organizationSlug);

  const repositories = useMemo(() => {
    return convertRepos(repoResp);
  }, [repoResp]);

  const form = useForm<AssetFormValues>({
    defaultValues: {
      ...asset,
      vulnAutoReopenAfterDays: asset.vulnAutoReopenAfterDays ?? -1,
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
      enableExposureMetrics: [
        asset.modifiedAttackVector,
        asset.modifiedAttackComplexity,
        asset.modifiedPrivilegesRequired,
        asset.modifiedScope,
        asset.modifiedUserInteraction,
        asset.modifiedConfidentiality,
        asset.modifiedIntegrity,
        asset.modifiedAvailability,
      ].some((v) => v && v !== "X"),
    },
  });

  useEffect(() => {
    form.resetField("sharesInformation", {
      defaultValue: asset.sharesInformation,
    });
  }, [asset.sharesInformation, form]);

  const assetScope = {
    organization: activeOrg.slug,
    projectSlug: project!.slug,
    assetSlug: asset.slug,
  };

  const handleTriggerBackgroundJobs = async () => {
    try {
      await triggerAssetPipeline(assetScope);
      toast.success("Background jobs triggered");
    } catch (error) {
      console.error("Failed to trigger background jobs:", error);
      toast.error("Failed to trigger background jobs");
    }
  };

  const handleRemoveMember = async (id: string) => {
    try {
      await removeAssetMember(assetScope, id);
      updateAsset({
        ...asset,
        members: asset.members.filter((member) => member.id !== id),
      });
      toast.success("Member deleted");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleChangeMemberRole = async (
    id: string,
    role: UserRole.Admin | UserRole.Member,
  ) => {
    try {
      await changeAssetMemberRole(assetScope, id, role);
      updateAsset({
        ...asset,
        members: asset.members.map((member) =>
          member.id === id ? { ...member, role } : member,
        ),
      });
      toast.success("Role successfully changed");
    } catch {
      toast.error("Failed to update member role");
    }
  };

  const handleGenerateNewSecret = async (type: SecretType) => {
    let bodyKey: string;
    if (type === "webhook") {
      bodyKey = "webhookSecret";
    }
    const secret = generateNewSecret();

    mutateSecrets(
      async (prev) => {
        const r = (await patchAsset(assetScope, {
          [bodyKey]: secret,
        })) as AssetDetailsWithSecretsDTO;

        updateAsset(r);
        return {
          ...prev,
          [bodyKey]: r["webhookSecret"],
        } as {
          webhookSecret: string;
        };
      },
      {
        optimisticData(currentData) {
          return {
            ...currentData,
            [bodyKey]: secret,
          } as {
            webhookSecret: string;
          };
        },
        revalidate: false,
      },
    );
  };

  const handleDeleteAsset = async () => {
    try {
      await deleteAsset(assetScope);
      toast("Repository deleted", {
        description: "The asset has been deleted",
      });
      router.push("/" + activeOrg.slug + "/projects/" + project!.slug);
    } catch {
      toast.error("Could not delete repository");
    }
  };

  const handleUpdate = async (data: Partial<AssetFormValues>) => {
    const newAsset = await patchAsset(assetScope, {
      ...data,
      cvssAutomaticTicketThreshold: firstOrUndefined(
        data.cvssAutomaticTicketThreshold,
      ),
      vulnAutoReopenAfterDays: data.vulnAutoReopenAfterDays
        ? +data.vulnAutoReopenAfterDays
        : -1,
      riskAutomaticTicketThreshold: firstOrUndefined(
        data.riskAutomaticTicketThreshold,
      ),
    } as Partial<components["schemas"]["dtos.AssetPatchRequest"]>);
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

  useAutoTour("repo-settings", repoSettingsTourSteps);

  return (
    <Page
      Menu={assetMenu}
      title="Repository Settings"
      description="Update the settings of this repository"
      Title={<AssetTitle />}
    >
      <div>
        <div
          data-tour="repo-settings-header"
          className="flex flex-row justify-between"
        >
          <h1 className="text-2xl font-semibold">Repository Settings</h1>
        </div>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleUpdate)}>
            <AssetForm
              disable={Boolean(asset.externalEntityProviderId)}
              form={form}
              assetId={asset.id}
              onUpdate={handleUpdate}
              repositories={repositories}
              parentRepositoryId={parentRepositoryId}
              parentRepositoryName={parentRepositoryName}
              repositoryName={asset.repositoryName}
              repositoryId={asset.repositoryId}
              organizationSlug={organizationSlug}
              projectSlug={projectSlug}
              assetSlug={assetSlug}
              repositoryProvider={
                asset.repositoryProvider as "github" | "gitlab" | undefined
              }
              members={asset.members}
              onRemoveMember={handleRemoveMember}
              onChangeMemberRole={handleChangeMemberRole}
            />
          </form>
        </FormProvider>
      </div>
      <hr />
      <AccessTokenManagement
        url={url}
        section={{
          title: "Generate your Repository Access Tokens",
          description:
            "Manage your repository access tokens that scanners and other integrations use to authenticate with DevGuard.",
        }}
      />
      <div>
        <Section
          data-tour="repo-settings-webhook"
          title="Incoming Webhook Management"
          description="Details for configuring incoming webhooks to receive for example issue updates from your issue tracker."
        >
          <div className="space-y-2 pt-4 pb-6 px-6 border shadow-sm rounded-xl bg-card mt-1">
            <InputWithButton
              label="Webhook URL"
              value={`${config.devguardApiUrlPublicInternet}/api/v1/webhook/`}
              nameKey="settings-webhook-url"
              message="You can use the URL to send webhook requests to this endpoint."
              variant="onCard"
              copyable
              copyToastDescription="The webhook URL has been copied to your clipboard."
            />

            <InputWithButton
              label="Webhook Secret"
              value={secrets?.webhookSecret ?? "No webhook secret set"}
              nameKey="settings-webhook-secret"
              message="This secret is used to authenticate the webhook requests. You need to set this secret in your webhook configuration."
              copyable
              copyToastDescription="The webhook secret has been copied to your clipboard."
              variant="onCard"
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
        <Section
          id="config-files"
          title="Configuration Files"
          description="View and edit configuration files for this repository, including scanner tool settings. These configurations override project-level settings for this specific repository."
        >
          <Card className="p-6">
            <div className="flex justify-end">
              <Link
                href={
                  "/" +
                  activeOrg.slug +
                  "/projects/" +
                  project!.slug +
                  "/assets/" +
                  asset.slug +
                  "/settings/config"
                }
              >
                <Button
                  data-tour="repo-settings-config-files"
                  variant={"outline"}
                >
                  Go to Configuration Files
                </Button>
              </Link>
            </div>
          </Card>
        </Section>
        <Section
          id="dependency-proxy"
          title="Dependency Proxy Settings"
          description="View and edit the settings for the Dependency Proxy, which caches dependencies to speed up builds and reduce load on external package registries."
        >
          <Card className="p-6">
            <div className="flex justify-end">
              <Link
                href={
                  "/" +
                  activeOrg.slug +
                  "/projects/" +
                  project!.slug +
                  "/assets/" +
                  asset.slug +
                  "/settings/dependency-proxy"
                }
              >
                <Button
                  data-tour="repo-settings-dependency-proxy"
                  variant={"outline"}
                >
                  Go to Dependency Proxy Settings
                </Button>
              </Link>
            </div>
          </Card>
        </Section>
        <hr />
      </div>

      <div data-tour="repo-settings-danger">
        <DangerZone>
          <Section
            className="m-2"
            title="Advanced"
            description="These settings are for advanced users only. Please be careful when changing these settings."
          >
            <div data-tour="repo-settings-public">
              <div className={classNames(!project.isPublic && "opacity-50")}>
                <ListItem
                  Description={
                    "Setting this to true will make the repository visible to the public."
                  }
                  Title="Public Repository"
                  Button={
                    <Switch
                      data-testid="publish-repo-switch"
                      disabled={!project.isPublic}
                      checked={asset.isPublic}
                      onCheckedChange={(checked) =>
                        handleUpdate({
                          isPublic: checked,
                        })
                      }
                    />
                  }
                />
              </div>
            </div>
            {!project.isPublic && (
              <small>
                The group is not public. You can not make the repository public.
              </small>
            )}
            {!asset.externalEntityProviderId && (
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
                    <Button
                      variant={"destructive"}
                      data-testid="delete-repository-button"
                    >
                      Delete
                    </Button>
                  </Alert>
                }
              />
            )}
          </Section>
        </DangerZone>
      </div>

      <Collapsible>
        <CollapsibleTrigger className="w-full cursor-pointer text-muted-foreground text-right px-4 py-2 mt-4 rounded-md font-medium text-xs">
          Debug
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div>
            <Button onClick={handleTriggerBackgroundJobs} variant={"outline"}>
              Trigger Background jobs
            </Button>
            <br />
            <small className="mt-4 block text-muted-foreground">
              Last Run: {asset.pipelineLastRun}
              <br />
              Error: <br />
              {asset.pipelineError ?? "No errors"}
            </small>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Page>
  );
};
export default Index;
