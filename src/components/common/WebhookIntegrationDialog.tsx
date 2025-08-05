import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useLoader } from "@/hooks/useLoader";
import { generateNewSecret } from "@/pages/[organizationSlug]/projects/[projectSlug]/assets/[assetSlug]/settings";
import { browserApiClient } from "@/services/devGuardApi";
import { WebhookDTO } from "@/types/api/api";
import React, { FunctionComponent, ReactNode, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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

interface Props {
  Button: ReactNode;
  onNewIntegration: (integration: WebhookDTO) => void;
  initialValues?: WebhookDTO;
  onDeleteWebhook?: (id?: string) => Promise<void>;
  projectWebhook: boolean;
}
export const WebhookIntegrationDialog: FunctionComponent<Props> = ({
  onNewIntegration,
  Button: Trigger,
  initialValues,
  onDeleteWebhook,
  projectWebhook,
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
  const [open, setOpen] = React.useState(false);
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
      <DialogTrigger asChild>{Trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Webhook</DialogTitle>
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
                    <Input placeholder="My Webhook" {...field} />
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
                    <Input placeholder="My Webhook" {...field} />
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
                      {...field}
                      copyable={true}
                      mutable={true}
                      SVG={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-4"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      }
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
                          checked={field.value}
                          onCheckedChange={field.onChange as any}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            <div className="flex flex-row justify-end">
              <div className="flex flex-col items-end justify-end gap-2">
                <div className="flex flex-row gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant={"secondary"}>
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
                        onClick={() => triggerTest("sampleSbom")}
                      >
                        SBOM
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button disabled={isLoading} type="submit">
                    <Loader />
                    {initialValues ? "Update Webhook" : "Save"}
                  </Button>
                  {initialValues && (
                    <AsyncButton
                      variant={"destructiveOutline"}
                      onClick={async () => {
                        if (onDeleteWebhook) {
                          await onDeleteWebhook(initialValues?.id);
                        }
                      }}
                    >
                      Delete
                    </AsyncButton>
                  )}
                </div>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
