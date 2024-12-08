import { FunctionComponent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

import { browserApiClient } from "@/services/devGuardApi";
import { InviteRequest } from "@/types/api/api";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Callout from "./common/Callout";
import { Button } from "./ui/button";
import { Form, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { useActiveOrg } from "@/hooks/useActiveOrg";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const MemberDialog: FunctionComponent<Props> = ({ isOpen, onOpenChange }) => {
  const form = useForm<InviteRequest>();
  const [invitationCode, setInvitationCode] = useState<string | null>(null);

  const activeOrg = useActiveOrg();

  const handleInvite = async (data: InviteRequest) => {
    const resp = await browserApiClient(
      "/organizations/" + activeOrg.slug + "/members",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );

    if (!resp.ok) {
      toast.error("Failed to invite member");
      return;
    }

    const { code } = await resp.json();
    const url = new URL(window.location.href);
    setInvitationCode(url.origin + "/accept-invitation?code=" + code);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Invite a new member to your organization by entering their email
            address. An invitation will be sent.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleInvite)}>
            <FormItem>
              <FormLabel>E-Mail Address</FormLabel>
              <Input type="email" {...form.register("email")} />
            </FormItem>
            <DialogFooter className="mt-4">
              <div className="flex flex-col items-end justify-end gap-2">
                <Button type="submit">Invite</Button>
                {Boolean(invitationCode) && (
                  <Callout intent="info">
                    <p>
                      Accept the invitation by visiting this link:{" "}
                      {invitationCode}
                    </p>
                  </Callout>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MemberDialog;
