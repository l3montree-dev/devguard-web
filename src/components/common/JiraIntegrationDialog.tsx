import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useLoader } from "@/hooks/useLoader";
import { browserApiClient } from "@/services/devGuardApi";
import { JiraIntegrationDTO } from "@/types/api/api";
import React, { FunctionComponent, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../ui/button";
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

interface Props {
  Button: ReactNode;
  onNewIntegration: (integration: JiraIntegrationDTO) => void;
}
export const JiraIntegrationDialog: FunctionComponent<Props> = ({
  onNewIntegration,
  Button: Trigger,
}) => {
  const form = useForm<{
    url: string;
    token: string;
    name: string;
    userEmail: string;
  }>();
  const { Loader, waitFor, isLoading } = useLoader();
  const activeOrg = useActiveOrg();
  const [open, setOpen] = React.useState(false);

  const handleSubmit = async (params: {
    url: string;
    token: string;
    name: string;
    userEmail: string;
  }) => {
    const res = await browserApiClient(
      "/organizations/" + activeOrg.slug + "/integrations/jira/test-and-save",
      {
        method: "POST",
        body: JSON.stringify({
          ...params,
          url: urlToBaseURL(params.url),
        }),
      },
    );
    if (res.ok) {
      const integration = await res.json();
      onNewIntegration(integration);
      setOpen(false);
    } else {
      toast.error("Your Jira token seems to be wrong");
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{Trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Integrate with Jira</DialogTitle>
          <DialogDescription>
            To integrate with Jira, you need to provide your Personal Access
            Token
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
                      placeholder="My Jira Personal Access Token"
                      autoComplete="url"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A name to identify the token later on.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jira User Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={"email@example.com"}
                      autoComplete="email"
                      type="email"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ensure that you provide the email address associated with
                    your Jira account.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jira URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={"https://your-domain.atlassian.net"}
                      autoComplete="url"
                      type="url"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ensure that you provide the full URL to your Jira instance,
                    including the protocol (https://).
                    <br />
                    For example: <code>https://your-domain.atlassian.net</code>
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jira Access-Token</FormLabel>
                  <FormControl>
                    <Input
                      required
                      autoComplete="off"
                      placeholder="xxxxxxxxxxxxxxx..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    DevGuard uses this token to <strong>create issues</strong>{" "}
                    in your repository.
                  </FormDescription>
                </FormItem>
              )}
            />
            <div className="flex flex-row justify-end">
              <div className="flex flex-col items-end justify-end gap-2">
                <Button disabled={isLoading} type="submit">
                  <Loader />
                  Test and Save
                </Button>
                <small className="text-muted-foreground">
                  Checks if the provided access token is valid.
                </small>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
