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
import RedmineIntegrationSettingsForm from "./RedmineIntegrationSettingsForm";

interface Props {
  integration: RedmineIntegrationDTO;
  Button: ReactNode;
  onSave: (integration: RedmineIntegrationDTO) => void;
}
export const RedmineIntegrationSettingsDialog: FunctionComponent<Props> = ({
  integration,
  onSave,
  Button: Trigger,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleSave = (updatedIntegration: RedmineIntegrationDTO) => {
    onSave(updatedIntegration);
    setOpen(false);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{Trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Integrate with Redmine</DialogTitle>
          <DialogDescription>
            Configure how the Redmine integration behaves.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <RedmineIntegrationSettingsForm
            integration={integration}
            onSave={handleSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
