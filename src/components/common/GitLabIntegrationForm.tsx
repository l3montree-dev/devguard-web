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
import { Checkbox } from "../ui/checkbox";
import { ImageZoom } from "./Zoom";
import { useTheme } from "next-themes";

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

  const { theme, resolvedTheme } = useTheme();
  const imageSrc =
    theme === "dark"
      ? "/assets/gitlab-create-token-dark.png"
      : "/assets/gitlab-create-token-white.png";

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();

          await waitFor(form.handleSubmit(handleSubmit))();
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
                  placeholder="My GitLab Personal Access Token"
                  autoComplete="url"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A name to help identify the token later on.
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
                Ensure that you provide <strong>only the{" "}
                base URL of your GitLab instance </strong> 
                (e.g. https://gitlab.example.com) without any repository paths.
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
                To later use the <strong>Auto Setup Feature</strong> the token needs <strong>at least the maintainer role</strong>.<br/>
                Otherwise the token only needs <strong>reporter role</strong> permissions.<br/>
                Additionally the api scope is needed for the seamless integration of DevGuard.
              </FormDescription>
            </FormItem>
          )}
        />
        <div className="flex flex-row justify-end mt-4">
          <div className="flex flex-col items-end justify-end gap-2">
            <div className="flex flex-row gap-3">
              {backButtonClick && (
                <Button
                  type="button"
                  variant={"secondary"}
                  onClick={backButtonClick}
                >
                  Back
                </Button>
              )}
              <Button disabled={isLoading} type="submit">
                <Loader />
                Test and Save
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
