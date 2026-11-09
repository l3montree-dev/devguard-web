// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import React, { type FunctionComponent, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import type { ExternalTicketProvider } from "@/types/common";

interface Props {
  Button: ReactNode;
  Form: (setOpen: (open: boolean) => void) => ReactNode;
  integration: ExternalTicketProvider;
  description: ReactNode | string;
}
export const IntegrationDialog: FunctionComponent<Props> = ({
  Button: Trigger,
  Form: IntegrationForm,
  integration,
  description,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{Trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Integrate with {integrationToName(integration)}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {IntegrationForm(setOpen)}
      </DialogContent>
    </Dialog>
  );
};

function integrationToName(integration: ExternalTicketProvider): string {
  switch (integration) {
    case "gitlab":
      return "GitLab";
    case "github":
      return "GitHub";
    case "jira":
      return "Jira";
    case "opencode":
      return "OpenCode";
    case "redmine":
      return "Redmine";
  }
}
