// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useLoader } from "@/hooks/useLoader";
import { browserApiClient } from "@/services/devGuardApi";
import type { WebhookDTO } from "@/types/api/api";
import React, {
  type FunctionComponent,
  type ReactNode,
  useEffect,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/lib/toast";
import { AsyncButton, Button } from "../ui/button";
import { Card } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../ui/form";
import { Input } from "../ui/input";
import { InputWithButton } from "../ui/input-with-button";
import { Switch } from "../ui/switch";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "../ui/dropdown-menu";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { generateNewSecret } from "../../utils/view";

interface Props {
  Button?: ReactNode;
  onNewIntegration: (integration: WebhookDTO) => void;
  initialValues?: WebhookDTO;
  onDeleteWebhook?: (id: string) => Promise<void>;
  projectWebhook: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export const WebhookIntegrationDialog: FunctionComponent<Props> = ({
  onNewIntegration,
  Button: Trigger,
  initialValues,
  onDeleteWebhook,
  projectWebhook,
  open: controlledOpen,
  onOpenChange,
}) => {
  const form = useForm<WebhookDTO>({
    defaultValues: initialValues || {
      name: "",
      description: "",
      url: "",
      secret: "",
      sbomEnabled: false,
      vulnEnabled: false,
    },
  });

  // Reset form values when initialValues change
  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
    } else {
      form.reset({
        name: "",
        description: "",
        url: "",
        secret: "",
        sbomEnabled: false,
        vulnEnabled: false,
      });
    }
  }, [initialValues, form]);

  const { Loader, waitFor, isLoading } = useLoader();
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [testLoading, setTestLoading] = React.useState(false);

  const method = initialValues ? "PUT" : "POST";

  let url =
    "/organizations/" + activeOrg.slug + "/integrations/webhook/test-and-save/";

  if (projectWebhook) {
    url =
      "/organizations/" +
      activeOrg.slug +
      "/projects/" +
      project.slug +
      "/integrations/webhook/test-and-save/";
  }

  const handleSubmit = async (params: {
    id?: string;
    url: string;
    name: string;
    description: string;
    secret: string;
    sbomEnabled: boolean;
    vulnEnabled: boolean;
  }) => {
    const res = await browserApiClient(url, {
      method: method,
      body: JSON.stringify({
        ...params,
        id: initialValues?.id,
      }),
    });
    if (res.ok) {
      const integration = await res.json();
      onNewIntegration(integration);
      setOpen(false);

      form.reset({
        name: "",
        description: "",
        url: "",
        secret: "",
        sbomEnabled: false,
        vulnEnabled: false,
      });
    } else {
      toast.error(
        "Something went wrong while testing the webhook. Please check the URL and token.",
      );
    }
  };

  const triggerTest = async (
    type: "sampleSbom" | "sampleDependencyVulns" | "sampleFirstPartyVulns",
  ) => {
    setTestLoading(true);
    const url = form.getValues("url");
    const secret = form.getValues("secret");
    const resp = await browserApiClient(
      "/organizations/" + activeOrg.slug + "/integrations/webhook/test/",
      {
        body: JSON.stringify({
          url,
          secret,
          payloadType: type,
        }),
        method: "POST",
      },
    );

    setTestLoading(false);

    if (!resp.ok) {
      toast.error(
        "Failed to send test payload. Please check the URL and secret.",
      );

      return resp;
    }

    toast.success("Test payload sent successfully!");
  };

  const handleGenerateNewSecret = () => {
    const newSecret = generateNewSecret();
    form.setValue("secret", newSecret);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      {Trigger && (
        <DialogTrigger data-testid="add-webhook-button" asChild>
          {Trigger}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialValues ? "Edit Webhook" : "Add a Webhook"}
          </DialogTitle>
          <DialogDescription>
            DevGuard uses webhooks to send notifications to your applications.
            You can use webhooks to receive notifications about events in
            DevGuard, such as new vulnerabilities, or SBOMs.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              waitFor(form.handleSubmit(handleSubmit))();
            }}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My Webhook"
                      data-testid="webhook-name-input"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A name to identify the webhook later on.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My Webhook"
                      data-testid="webhook-description-input"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A description to identify the webhook later on.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={"https://example.com/webhook"}
                      autoComplete="url"
                      type="url"
                      required
                      data-testid="webhook-url-input"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The URL to which DevGuard will send the webhook
                    notifications. Ensure that the URL is publicly accessible
                    and can receive POST requests from DevGuard.
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secret"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputWithButton
                      label="Secret token"
                      placeholder="the secret"
                      nameKey="webhook-integration-secret-token"
                      data-testid="webhook-secret-input"
                      {...field}
                      copyable={true}
                      copyToastDescription="The webhook secret has been copied to your clipboard."
                      mutable={true}
                      update={{
                        update: handleGenerateNewSecret,
                        updateConfirmTitle: "Generate new secret",
                        updateConfirmDescription:
                          "Are you sure you want to generate a new secret? This will invalidate the old secret.",
                      }}
                      onClick={handleGenerateNewSecret}
                    />
                  </FormControl>
                  <FormDescription>
                    A secret to verify the webhook payloads. This is optional
                    but recommended for security reasons.
                  </FormDescription>
                </FormItem>
              )}
            />

            <div>
              <span className="text-m font-medium"> Trigger Events</span>
            </div>
            <Card>
              <div className="flex flex-col gap-4 p-2">
                <FormField
                  control={form.control}
                  name="sbomEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row justify-between items-center">
                      <FormLabel>Enable SBOM Notifications</FormLabel>
                      <FormControl>
                        <Switch
                          data-testid="webhook-sbom-switch"
                          checked={field.value}
                          onCheckedChange={field.onChange as any}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vulnEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row justify-between items-center">
                      <FormLabel>Enable Vulnerability Notifications</FormLabel>
                      <FormControl>
                        <Switch
                          data-testid="webhook-vuln-switch"
                          checked={field.value}
                          onCheckedChange={field.onChange as any}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            <div className="flex flex-row justify-end" data-testid="webhook-edit-buttons">
              <div className="flex flex-col items-end justify-end gap-2">
                <div className="flex flex-row gap-2">
                  {initialValues && (
                    <AsyncButton
                      variant={"destructiveOutline"}
                      data-testid="delete-webhook-button"
                      onClick={async () => {
                        if (onDeleteWebhook) {
                          await onDeleteWebhook(initialValues?.id);
                        }
                      }}
                    >
                      Delete
                    </AsyncButton>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={"secondary"}
                        type="button"
                        data-testid="test-webhook-payload"
                      >
                        {testLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Send Test{" "}
                        <ChevronDownIcon
                          className="ml-2"
                          width={16}
                          height={16}
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => triggerTest("sampleDependencyVulns")}
                      >
                        Dependency Risks
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => triggerTest("sampleSbom")}
                      >
                        Code-Risks
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        data-testid="test-webhook-payload-sbom"
                        onClick={() => triggerTest("sampleSbom")}
                      >
                        SBOM
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    disabled={isLoading}
                    type="submit"
                    data-testid="webhook-submit-button"
                  >
                    <Loader />
                    {initialValues ? "Update Webhook" : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
