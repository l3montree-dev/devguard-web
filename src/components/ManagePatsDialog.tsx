// Copyright 2026 L3montree GmbH.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { FunctionComponent, PropsWithChildren, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { PersonalAccessTokenDTO } from "@/types/api/api";
import { Button } from "./ui/button";
import DateString, { parseDateOnly } from "./common/DateString";
import ConfirmTokenDeletion from "./common/ConfirmTokenDeletion";
import { Badge } from "./ui/badge";

interface Props {
  personalAccessTokens: PersonalAccessTokenDTO[];
  onDeletePat: (pat: PersonalAccessTokenDTO) => Promise<void>;
}

const ManagePatsDialog: FunctionComponent<PropsWithChildren<Props>> = ({
  personalAccessTokens,
  onDeletePat,
  children,
}) => {
  const [open, setOpen] = useState(false);

  const handleDelete = async (pat: PersonalAccessTokenDTO) => {
    await onDeletePat(pat);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent setOpen={setOpen} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Personal Access Tokens</DialogTitle>
          <DialogDescription>
            View and manage your existing personal access tokens. You can revoke
            tokens that are no longer needed.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {personalAccessTokens.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No personal access tokens found.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {personalAccessTokens.map((pat) => (
                <div
                  key={pat.id}
                  className="flex flex-col gap-2 rounded-lg border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">
                        {pat.description || "Unnamed Token"}
                      </h4>
                      <div className="my-2 flex flex-wrap gap-1 items-center">
                        <span className="text-muted-foreground text-sm">
                          Scopes:
                        </span>
                        {pat.scopes.split(" ").map((scope) => (
                          <Badge key={scope} variant="secondary">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <ConfirmTokenDeletion
                      Button={
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(pat)}
                        >
                          Yes, Revoke
                        </Button>
                      }
                    >
                      <Button variant="destructiveOutline" size="sm">
                        Revoke
                      </Button>
                    </ConfirmTokenDeletion>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <span>
                        Created:{" "}
                        <DateString date={parseDateOnly(pat.createdAt)} />
                      </span>
                      <span>
                        Last used:{" "}
                        {pat.lastUsedAt ? (
                          <DateString date={parseDateOnly(pat.lastUsedAt)} />
                        ) : (
                          "Never"
                        )}
                      </span>
                    </div>
                    <div className="mt-1 text-xs font-mono truncate">
                      Fingerprint: {pat.fingerprint}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManagePatsDialog;
