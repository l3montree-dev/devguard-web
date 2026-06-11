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
import type { TrivyOperatorIntegrationDTO } from "@/types/api/api";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface Props {
  onNewIntegration: (integration: TrivyOperatorIntegrationDTO) => void;
}

export default function TrivyOperatorIntegrationForm({
  onNewIntegration,
}: Props) {
  const form = useForm<{ name: string; clusterId: string }>();
  const { Loader, waitFor, isLoading } = useLoader();
  const activeOrg = useActiveOrg();

  const handleSubmit = async (params: { name: string; clusterId: string }) => {
    const res = await browserApiClient(
      "/organizations/" + activeOrg.slug + "/integrations/trivy-operator/",
      {
        method: "POST",
        body: JSON.stringify(params),
      },
    );
    if (res.ok) {
      const integration = await res.json();
      onNewIntegration(integration);
    } else {
      toast.error("Failed to create Trivy Operator integration");
    }
  };

  return (
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
                  placeholder="My Kubernetes Cluster"
                  required
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A name to identify this integration.
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clusterId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cluster ID</FormLabel>
              <FormControl>
                <Input placeholder="production-cluster" required {...field} />
              </FormControl>
              <FormDescription>
                A unique identifier for the Kubernetes cluster. Used to group
                namespaces under a project.
              </FormDescription>
            </FormItem>
          )}
        />
        <div className="flex flex-row justify-end">
          <Button disabled={isLoading} type="submit">
            <Loader />
            Create Integration
          </Button>
        </div>
      </form>
    </Form>
  );
}
