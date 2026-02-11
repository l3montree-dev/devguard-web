// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { FunctionComponent, useState } from "react";
import Image from "next/image";
import MarkdownEditor from "./common/MarkdownEditor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { AsyncButton, Button } from "./ui/button";
import GitProviderIcon from "./GitProviderIcon";

interface MitigateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (justification: string) => Promise<boolean>;
  integrationType: "github" | "gitlab" | "jira" | undefined;
  gitlabIntegration?: string;
}

const MitigateDialog: FunctionComponent<MitigateDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  integrationType,
  gitlabIntegration,
}) => {
  const [justification, setJustification] = useState<string>("");

  const handleSubmit = async () => {
    const success = await onSubmit(justification);
    if (success) {
      setJustification("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Ticket </DialogTitle>
          <DialogDescription>
            Create a ticket in your integrated issue tracker to track the
            mitigation of this vulnerability.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Justification
            </label>
            <MarkdownEditor
              className="!bg-card"
              placeholder="Add your justification for mitigating this vulnerability..."
              value={justification}
              setValue={(value) => setJustification(value ?? "")}
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <AsyncButton variant={"secondary"} onClick={handleSubmit}>
              <div className="flex flex-row items-center">
                {integrationType === "gitlab" && (
                  <>
                    <GitProviderIcon
                      externalEntityProviderIdOrRepositoryId={gitlabIntegration}
                    />
                    <span className="ml-2">Create GitLab Issue</span>
                  </>
                )}
                {integrationType === "github" && (
                  <>
                    <Image
                      alt="GitHub Logo"
                      width={15}
                      height={15}
                      className="dark:invert"
                      src={"/assets/github.svg"}
                    />
                    <span className="ml-2">Create GitHub Ticket</span>
                  </>
                )}
                {integrationType === "jira" && (
                  <>
                    <Image
                      alt="Jira Logo"
                      width={15}
                      height={15}
                      src={"/assets/jira-svgrepo-com.svg"}
                    />
                    <span className="ml-2">Create Jira Ticket</span>
                  </>
                )}
                {integrationType === undefined && "Create Ticket"}
              </div>
            </AsyncButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MitigateDialog;
