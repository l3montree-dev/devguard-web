// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { JiraIntegrationDTO } from "@/types/dto";
import React, { type FunctionComponent, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import JiraIntegrationForm from "./JiraIntegrationForm";

interface Props {
  Button: ReactNode;
  onNewIntegration: (integration: JiraIntegrationDTO) => void;
}
export const JiraIntegrationDialog: FunctionComponent<Props> = ({
  onNewIntegration,
  Button: Trigger,
}) => {
  const [open, setOpen] = React.useState(false);

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
        <JiraIntegrationForm onNewIntegration={onNewIntegration} />
      </DialogContent>
    </Dialog>
  );
};
