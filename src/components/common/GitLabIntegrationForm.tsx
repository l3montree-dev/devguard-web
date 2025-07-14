import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { useLoader } from "@/hooks/useLoader";
import { browserApiClient } from "@/services/devGuardApi";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { toast } from "sonner";
import { GitLabIntegrationDTO } from "@/types/api/api";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function urlToBaseURL(url: string): string {
  const regex = /^(https?:\/\/[^\/]+)/i; //regex rule https://regex101.com/r/n3xN3y/1
  const formatedUrl = url.split(regex);

  return formatedUrl[1];
}

export interface GitLabIntegrationFormProps {
  onNewIntegration: (integration: GitLabIntegrationDTO) => void;
  setOpen?: (open: boolean) => void;
  additionalOnClick?: () => void;
  backButtonClick?: () => void;
}

export default function GitLabIntegrationForm({
  onNewIntegration,
  setOpen,
  additionalOnClick,
  backButtonClick,
}: GitLabIntegrationFormProps) {
  const form = useForm<{ url: string; token: string; name: string }>();
  const activeOrg = useActiveOrg();
  const { Loader, waitFor, isLoading } = useLoader();

  const handleSubmit = async (params: {
    url: string;
    token: string;
    name: string;
  }) => {
    const res = await browserApiClient(
      "/organizations/" + activeOrg.slug + "/integrations/gitlab/test-and-save",
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
      if (setOpen) {
        setOpen(false);
      }
    } else {
      toast.error(
        "Your Gitlab/ openCode token seems to be wrong, check if the token has at least reporter access or is pasted correctly",
      );
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          waitFor(form.handleSubmit(handleSubmit))();
          if (additionalOnClick) {
            additionalOnClick();
          }
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
                  placeholder="My GitLab/ openCode Personal Access Token"
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
              <FormLabel>GitLab/ openCode URL</FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    "https://gitlab.com/ or https://gitlab.opencode.de/"
                  }
                  autoComplete="url"
                  type="url"
                  required
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Ensure that you provide only the{" "}
                <strong>base URL of your GitLab instance </strong> (e.g.,
                https://gitlab.example.com) without any repository paths.
                Including the full URL with the repository path may result in an
                error.{" "}
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Access-Token</FormLabel>
              <FormControl>
                <Input placeholder="glpat-xxxxxxxxxxx-xxxx" {...field} />
              </FormControl>
              <FormDescription>
                DevGuard uses this token to <strong>create issues</strong> in
                your repository. Thus the token needs to have{" "}
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
            <div className="flex flex-row gap-4">
              {backButtonClick && (
                <Button variant={"secondary"} onClick={backButtonClick}>
                  Back
                </Button>
              )}
              <Button disabled={isLoading} type="submit">
                <Loader />
                Test and Save
              </Button>
            </div>
            <small className="text-muted-foreground">
              Checks if the provided access token is valid and has at least
              Reporter-Access.
            </small>
          </div>
        </div>
      </form>
    </Form>
  );
}
