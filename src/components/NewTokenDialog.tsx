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
import { AlertTriangle } from "lucide-react";
import { Badge } from "./ui/badge";

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

        <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-500" />
            <div className="text-sm">
              <p className="font-medium text-yellow-500">
                Make sure to copy your token now!
              </p>
              <p className="mt-1 text-muted-foreground">
                You won&apos;t be able to see it again. Store it securely as it
                provides access to your account.
              </p>
            </div>
          </div>
        </div>

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
              {token.scopes.split(" ").map((scope) => (
                <Badge key={scope} variant="secondary">
                  {scope}
                </Badge>
              ))}
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
