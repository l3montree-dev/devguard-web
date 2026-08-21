// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { GitLabIntegrationDTO } from "@/types/api/api";
import React, { type FunctionComponent, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import GitLabIntegrationForm from "./GitLabIntegrationForm";

interface Props {
  Button: ReactNode;
  onNewIntegration: (integration: GitLabIntegrationDTO) => void;
}
export const GitLabIntegrationDialog: FunctionComponent<Props> = ({
  onNewIntegration,
  Button: Trigger,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{Trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Integrate with GitLab</DialogTitle>
          <DialogDescription>
            To integrate with GitLab a personal access token, a group access
            token or a repository access token is necessary.
          </DialogDescription>
        </DialogHeader>
        <GitLabIntegrationForm
          onNewIntegration={onNewIntegration}
          setOpen={setOpen}
        />
      </DialogContent>
    </Dialog>
  );
};
