// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { browserApiClient } from "@/services/devGuardApi";
import { Form } from "./ui/form";

import { InvitationForm } from "@/components/InvitationForm";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

import { toast } from "@/lib/toast";
import { extractInvitationCode } from "@/utils/url";
import { writeLocalStorage } from "@/hooks/useLocalStorage";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

import type { InvitationFormValues } from "@/types/view/invitation";

export default function AcceptInvitationDialog({
  isOpen,
  onOpenChange,
}: Props) {
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

    writeLocalStorage("lastActiveOrg", slug);
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
                data-testid="join-organization-dialog"
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
