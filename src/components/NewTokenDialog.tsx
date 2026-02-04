// Copyright 2026 L3montree GmbH.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FunctionComponent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { PatWithPrivKey } from "@/types/api/api";
import { Button } from "./ui/button";
import CopyInput from "./common/CopyInput";
import { Badge } from "./ui/badge";
import Callout from "./common/Callout";

interface Props {
  token: PatWithPrivKey | null;
  open: boolean;
  onClose: () => void;
}

const NewTokenDialog: FunctionComponent<Props> = ({ token, open, onClose }) => {
  if (!token) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Personal Access Token Created</DialogTitle>
          <DialogDescription>
            Your new personal access token has been created successfully.
          </DialogDescription>
        </DialogHeader>

        <Callout intent="warning" showIcon>
          <p className="font-medium">Make sure to copy your token now!</p>
          <p className="mt-1">
            You won&apos;t be able to see it again. Store it securely as it
            provides access to your account.
          </p>
        </Callout>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Description</label>
            <p className="text-sm text-muted-foreground">
              {token.description || "No description"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Scopes</label>
            <div className="mt-1 flex flex-wrap gap-1">
              {token.scopes.split(" ").filter((scope) => scope.trim() !== "")
                .length > 0 ? (
                token.scopes
                  .split(" ")
                  .filter((scope) => scope.trim() !== "")
                  .map((scope, index) => (
                    <Badge key={`${scope}-${index}`} variant="secondary">
                      {scope}
                    </Badge>
                  ))
              ) : (
                <span className="text-sm text-muted-foreground">No scopes</span>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Token</label>
            <div className="mt-1">
              <CopyInput value={token.privKey} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewTokenDialog;
