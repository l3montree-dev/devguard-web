import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useLoader } from "@/hooks/useLoader";
import { browserApiClient } from "@/services/devGuardApi";
import { WebhookDTO } from "@/types/api/api";
import React, { FunctionComponent, ReactNode } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { AsyncButton, Button } from "../ui/button";
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
import { urlToBaseURL } from "../../utils/url";
import { Switch } from "../ui/switch";
import { on } from "events";

interface Props {
  Button: ReactNode;
  onNewIntegration: (integration: WebhookDTO) => void;
  initialValues?: WebhookDTO;
  onDeleteWebhook?: (id?: string) => Promise<void>;
}
export const WebhookIntegrationDialog: FunctionComponent<Props> = ({
  onNewIntegration,
  Button: Trigger,
  initialValues,
  onDeleteWebhook,
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
  const { Loader, waitFor, isLoading } = useLoader();
  const activeOrg = useActiveOrg();
  const [open, setOpen] = React.useState(false);

  const method = initialValues ? "PUT" : "POST";

  const handleSubmit = async (params: {
    id?: string;
    url: string;
    name: string;
    description: string;
    secret: string;
    sbomEnabled: boolean;
    vulnEnabled: boolean;
  }) => {
    const res = await browserApiClient(
      "/organizations/" +
        activeOrg.slug +
        "/integrations/webhook/test-and-save/",
      {
        method: method,
        body: JSON.stringify({
          ...params,
          id: initialValues?.id,
          url: urlToBaseURL(params.url),
        }),
      },
    );
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
                    <Input
                      placeholder="My Webhook"
                      {...field}
                      defaultValue={initialValues?.name}
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
                      {...field}
                      defaultValue={initialValues?.description}
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
                      {...field}
                      defaultValue={initialValues?.url}
                    />
                  </FormControl>
                  <FormDescription>
                    The URL to which DevGuard will send the webhook
                    notifications.
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret token </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="my-secret"
                      {...field}
                      defaultValue={initialValues?.secret}
                    />
                  </FormControl>
                  <FormDescription>
                    A secret to sign the webhook payloads. This is optional but
                    recommended for security reasons.
                  </FormDescription>
                </FormItem>
              )}
            />
            <div>
              <span className="text-sm font-medium"> Trigger Events</span>
            </div>
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

            <div className="flex flex-row justify-end">
              <div className="flex flex-col items-end justify-end gap-2">
                <div className="flex flex-row gap-2">
                  <Button disabled={isLoading} type="submit">
                    <Loader />
                    {initialValues ? "Update Webhook" : "Test and Save"}
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
                <small className="text-muted-foreground">
                  Ensure that the URL is publicly accessible and can receive
                  POST requests from DevGuard.
                </small>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
