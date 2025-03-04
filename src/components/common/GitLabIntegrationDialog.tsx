import React, { FunctionComponent, ReactNode } from "react";
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
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { browserApiClient } from "@/services/devGuardApi";
import { useLoader } from "@/hooks/useLoader";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { GitLabIntegrationDTO } from "@/types/api/api";
import { toast } from "sonner";

interface Props {
  Button: ReactNode;
  onNewIntegration: (integration: GitLabIntegrationDTO) => void;
}
const GitLabIntegrationDialog: FunctionComponent<Props> = ({
  onNewIntegration,
  Button: Trigger,
}) => {
  const form = useForm<{ url: string; token: string; name: string }>();
  const { Loader, waitFor, isLoading } = useLoader();
  const activeOrg = useActiveOrg();
  const [open, setOpen] = React.useState(false);

  const handleSubmit = async (params: {
    url: string;
    token: string;
    name: string;
  }) => {
    const res = await browserApiClient(
      "/organizations/" + activeOrg.slug + "/integrations/gitlab/test-and-save",
      {
        method: "POST",
        body: JSON.stringify(params),
      },
    );
    if (res.ok) {
      const integration = await res.json();
      onNewIntegration(integration);
      setOpen(false);
    } else {
      toast.error(
        "Your Gitlab token seems to be wrong, check if the token has at least reporter access or is pasted correctly",
      );
    }
  };
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{Trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Integrate with GitLab</DialogTitle>
          <DialogDescription>
            To integrate with GitLab a personal access token, a group access
            token or a project access token is necessary.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const regex = /^(https?:\/\/[^\/]+)/i; //regex rule https://regex101.com/r/n3xN3y/1
              const regexUrl = form.getValues("url");
              const formatedUrl = regexUrl.split(regex);
              form.setValue("url", `${formatedUrl[1]}`); //updated url
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
                      placeholder="My GitLab Personal Access Token"
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
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitLab URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={"https://gitlab.com/"}
                      autoComplete="url"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ensure that you provide only the{" "}
                    <strong>base URL of your GitLab instance </strong> (e.g.,
                    https://gitlab.example.com) without any repository paths.
                    Including the full URL with the repository path may result
                    in an error.{" "}
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitLab Access-Token</FormLabel>
                  <FormControl>
                    <Input placeholder="glpat-xxxxxxxxxxx-xxxx" {...field} />
                  </FormControl>
                  <FormDescription>
                    DevGuard uses this token to <strong>create issues</strong>{" "}
                    in your repository. Thus the token needs to have{" "}
                    <strong>at least reporter access</strong>.<br />
                    There are features in DevGuard, that require higher access
                    levels. For example, DevGuard can automatically create merge
                    requests for you. In this case, the token needs to have{" "}
                    <strong>developer access</strong>.
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
                  Checks if the provided access token is valid and has at least
                  Reporter-Access.
                </small>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GitLabIntegrationDialog;
