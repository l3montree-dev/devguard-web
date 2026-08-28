// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useState } from "react";
import type { FunctionComponent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

import { inviteOrgMember } from "@/services/organizationService";
import type { InviteRequest } from "@/types/dto";
import { useForm } from "react-hook-form";
import { toast } from "@/lib/toast";
import Callout from "./common/Callout";
import { Button } from "./ui/button";
import { Form, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import InlineCopy from "./common/InlineCopy";
import { truncateMiddle } from "@/utils/common";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const MemberDialog: FunctionComponent<Props> = ({ isOpen, onOpenChange }) => {
  const form = useForm<InviteRequest>();
  const [invitationCode, setInvitationCode] = useState<string | null>(null);

  const activeOrg = useActiveOrg();

  const handleInvite = async (data: InviteRequest) => {
    let invitation;
    try {
      invitation = await inviteOrgMember(activeOrg.slug, data as never);
    } catch (error) {
      toast.error(
        (error as { status?: number }).status === 409
          ? "User is already member of the organization"
          : "Failed to invite member",
      );
      return;
    }

    const { code } = invitation as { code: string };
    const url = new URL(window.location.href);
    setInvitationCode(url.origin + "/accept-invitation?code=" + code);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Invite a new member to your organization{" "}
            <span className="font-semibold truncate text-foreground">
              {truncateMiddle(activeOrg.name)}
            </span>{" "}
            by entering their email address.
          </DialogDescription>
          <div className="mt-2">
            <Callout intent="warning">
              Currently DevGuard does not send any E-Mails. Please copy the link
              and forward it manually.
            </Callout>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleInvite)}>
            <FormItem>
              <FormLabel>E-Mail Address</FormLabel>
              <Input
                data-testid="mail-input"
                type="email"
                {...form.register("email")}
              />
            </FormItem>
            <DialogFooter className="mt-4">
              <div className="flex flex-col items-end justify-end gap-2">
                <Button data-testid="invite-member-button" type="submit">
                  Invite
                </Button>
                {Boolean(invitationCode) && (
                  <Callout intent="info">
                    <p>
                      Accept the invitation by visiting this link :{" "}
                      <InlineCopy content={invitationCode!} />
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
