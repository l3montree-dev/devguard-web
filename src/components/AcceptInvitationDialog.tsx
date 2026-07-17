import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { browserApiClient } from "@/services/devGuardApi";
import { Form } from "./ui/form";

import { InvitationForm } from "@/components/InvitationForm";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

import { toast } from "@/lib/toast";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InvitationFormValues {
  "invitation-url": string;
}

const extractInvitationCode = (input: string): string | undefined => {
  const trimmed = input.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const url = new URL(trimmed);
    const code = url.searchParams.get("code");
    return code ?? undefined;
  } catch {
    return trimmed;
  }
};

export default function AcceptInvitationDialog({ isOpen, onOpenChange }: Props) {
  const form = useForm<InvitationFormValues>();

  const router = useRouter();

  const handleJoinOrganization = async (data: InvitationFormValues) => {
    const code = extractInvitationCode(data["invitation-url"]);

    if (!code) {
      form.setError("invitation-url", {
        type: "manual",
        message: "Please enter a valid invitation url or code.",
      });
      return;
    }

    const resp = await browserApiClient("/accept-invitation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (!resp.ok) {
      toast.error("Could not accept invitation", {
        description:
          "The invitation code is invalid or bound to a different account. Please check the code and make sure you are logged in with the correct account.",
      });
      return;
    }

    const { slug } = await resp.json();

    toast.success("Successfully joined the organization");

    form.reset();
    onOpenChange(false);

    localStorage.setItem("lastActiveOrg", slug);
    router.replace(`/${slug}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join an Organization</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="text-black dark:text-white"
            onSubmit={form.handleSubmit(handleJoinOrganization)}
          >
            <InvitationForm />

            <div className="-mt-6 flex items-center justify-end gap-x-6">
              <Button
                disabled={form.formState.isSubmitting}
                isSubmitting={form.formState.isSubmitting}
                type="submit"
              >
                Join Organization
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
