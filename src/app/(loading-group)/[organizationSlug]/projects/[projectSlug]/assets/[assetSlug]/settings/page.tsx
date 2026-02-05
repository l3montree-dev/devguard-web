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
import { FunctionComponent, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import Alert from "../../../../../../../../components/common/Alert";
import DangerZone from "../../../../../../../../components/common/DangerZone";
import ListItem from "../../../../../../../../components/common/ListItem";
import { useUpdateAsset } from "../../../../../../../../context/AssetContext";
import { useConfig } from "../../../../../../../../context/ConfigContext";
import { fetcher } from "../../../../../../../../data-fetcher/fetcher";
import useDecodedParams from "../../../../../../../../hooks/useDecodedParams";
import { AssetDTO, UserRole } from "../../../../../../../../types/api/api";
import {
  generateNewSecret,
  getParentRepositoryIdAndName,
} from "../../../../../../../../utils/view";
import { Switch } from "../../../../../../../../components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../../../../../../components/ui/collapsible";
import DateString from "../../../../../../../../components/common/DateString";
import Section from "@/components/common/Section";

const firstOrUndefined = (el?: number[]): number | undefined => {
  if (!el) {
    return undefined;
  }
  return el[0];
};

type SecretType = "webhook";

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

  const form = useForm<AssetFormValues>({
    defaultValues: {
      ...asset,
      reachableFromInternet: asset.reachableFromInternet ?? false,
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
    },
  });

  const handleTriggerBackgroundJobs = async () => {
    const resp = await browserApiClient(
      "/organizations/" +
        activeOrg.slug +
        "/projects/" +
        project!.slug + // can never be null
        "/assets/" +
        asset.slug +
        "/pipeline-trigger",
      {
        method: "POST",
      },
    );

    if (resp.ok) {
      toast.success("Background jobs triggered");
    } else {
      // error
      // read the body
      const errorBody = await resp.text();
      console.error("Failed to trigger background jobs:", errorBody);
      toast.error("Failed to trigger background jobs");
    }
  };

  const handleRemoveMember = async (id: string) => {
    const resp = await browserApiClient(
      "/organizations/" +
        activeOrg.slug +
        "/projects/" +
        project?.slug +
        "/assets/" +
        asset.slug +
        "/members/" +
        id,
      {
        method: "DELETE",
      },
    );

    if (resp.ok) {
      updateAsset({
        ...asset,
        members: asset.members.filter((member) => member.id !== id),
      });
      toast.success("Member deleted");
    } else {
      toast.error("Failed to remove member");
    }
  };

  const handleChangeMemberRole = async (
    id: string,
    role: UserRole.Admin | UserRole.Member,
  ) => {
    const resp = await browserApiClient(
      "/organizations/" +
        activeOrg.slug +
        "/projects/" +
        project?.slug +
        "/assets" +
        asset.slug +
        "/members/" +
        id,
      {
        method: "PUT",
        body: JSON.stringify({ role }),
      },
    );

    if (resp.ok) {
      updateAsset({
        ...asset,
        members: asset.members.map((member) =>
          member.id === id ? { ...member, role } : member,
        ),
      });
      toast.success("Role successfully changed");
    } else {
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
            : -1,
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
              members={asset.members}
              onRemoveMember={handleRemoveMember}
              onChangeMemberRole={handleChangeMemberRole}
            />
          </form>
        </FormProvider>
      </div>
      <hr />
      <div>
        <Section
          title="Incoming Webhook Management"
          description="Details for configuring incoming webhooks to receive for example issue updates from your issue tracker."
        >
          <div className="space-y-2 pt-4 pb-6 px-6 border rounded-xl bg-card mt-1">
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
      </div>

      <DangerZone>
        <Section
          className="m-2"
          title="Advanced"
          description="These settings are for advanced users only. Please be careful when changing these settings."
        >
          <ListItem
            Description={
              "Setting this to true will make the repository visible to the public."
            }
            Title="Public Repository"
            Button={
              <Switch
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
                  <Button variant={"destructive"}>Delete</Button>
                </Alert>
              }
            />
          )}
        </Section>
      </DangerZone>

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
