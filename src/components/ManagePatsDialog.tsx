// Copyright 2026 L3montree GmbH.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState } from "react";
import type { FunctionComponent, PropsWithChildren } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import type { PersonalAccessTokenDTO } from "@/types/api/api";
import { Button } from "./ui/button";
import DateString, { parseDateOnly } from "./common/DateString";
import ConfirmTokenDeletion from "./common/ConfirmTokenDeletion";
import ListItem from "./common/ListItem";
import { AlertTriangleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  personalAccessTokens: PersonalAccessTokenDTO[];
  onDeletePat: (pat: PersonalAccessTokenDTO) => Promise<void>;
}

const getExpiryState = (expiryDateUnix: number | undefined) => {
  if (!expiryDateUnix) return "none";
  const now = Date.now() / 1000;
  if (expiryDateUnix < now) return "expired";
  if (expiryDateUnix - now < 7 * 24 * 60 * 60) return "soon";
  return "ok";
};

const ManagePatsDialog: FunctionComponent<PropsWithChildren<Props>> = ({
  personalAccessTokens,
  onDeletePat,
  children,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent setOpen={setOpen} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Personal Access Tokens</DialogTitle>
          <DialogDescription>
            View and revoke your existing personal access tokens.
          </DialogDescription>
        </DialogHeader>
        <div>
          {personalAccessTokens.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No personal access tokens found.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {personalAccessTokens.map((pat) => {
                const isAsymmetric = "fingerprint" in pat && !!pat.fingerprint;
                const expiryState = getExpiryState(pat.expiryDateUnix);

                return (
                  <ListItem
                    key={pat.id}
                    Title={pat.description || "Unnamed Token"}
                    Description={
                      <span className="inline-flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                        {isAsymmetric ? "Asymmetric" : "Symmetric (Bearer)"}
                        {", scopes: "}
                        {pat.scopes.split(" ").filter(Boolean).join(", ")}
                        {", created "}
                        <DateString date={parseDateOnly(pat.createdAt)} />
                        {", expires "}
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5",
                            expiryState === "expired" && "text-destructive",
                            expiryState === "soon" &&
                              "text-yellow-600 dark:text-yellow-400",
                          )}
                        >
                          {(expiryState === "expired" ||
                            expiryState === "soon") && (
                            <AlertTriangleIcon className="h-3 w-3 shrink-0" />
                          )}
                          {pat.expiryDateUnix
                            ? new Date(
                                pat.expiryDateUnix * 1000,
                              ).toLocaleDateString(undefined, {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "never"}
                        </span>
                      </span>
                    }
                    Button={
                      <ConfirmTokenDeletion
                        Button={
                          <Button
                            variant="destructive"
                            onClick={() => onDeletePat(pat)}
                          >
                            Yes, Revoke
                          </Button>
                        }
                      >
                        <Button variant="destructiveOutline" size="sm">
                          Revoke
                        </Button>
                      </ConfirmTokenDeletion>
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManagePatsDialog;
