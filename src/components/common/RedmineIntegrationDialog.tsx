// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { RedmineIntegrationDTO } from "@/types/dto";
import React, { type FunctionComponent, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import RedmineIntegrationForm from "./RedmineIntegrationForm";

interface Props {
  Button: ReactNode;
  onNewIntegration: (integration: RedmineIntegrationDTO) => void;
}
export const RedmineIntegrationDialog: FunctionComponent<Props> = ({
  onNewIntegration,
  Button: Trigger,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{Trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Integrate with Redmine</DialogTitle>
          <DialogDescription>
            To integrate with Redmine, you need to provide your Personal Access
            Token
          </DialogDescription>
        </DialogHeader>
        <RedmineIntegrationForm onNewIntegration={onNewIntegration} />
      </DialogContent>
    </Dialog>
  );
};
