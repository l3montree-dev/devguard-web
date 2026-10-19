// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { useState, useEffect } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { checkForUpdate, toMinorVersion } from "@/services/versionCheck";
import type { VersionCheckResult } from "@/types/view/admin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const SHOWN_PAIR_KEY = "devguard-update-dialog-shown";

export default function UpdateAvailableDialog() {
  const currentUser = useCurrentUser();
  const { data: info } = useApiQuery(currentUser ? "/info" : null);
  const instanceVersion = info ? "v1.15.0" : undefined; //test

  const [check, setCheck] = useState<VersionCheckResult | null>(null);
  const [shownPair, storeShownPair] = useLocalStorage(SHOWN_PAIR_KEY);

  useEffect(() => {
    if (!instanceVersion) return;
    let ignore = false;
    checkForUpdate(instanceVersion, "minor")
      .then((result) => {
        if (!ignore) setCheck(result);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [instanceVersion]);

  if (!check || !instanceVersion) return null;

  const currentPair =
    toMinorVersion(instanceVersion) +
    "->" +
    toMinorVersion(check.latestVersion);
  const open = check.updateAvailable && shownPair !== currentPair;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) storeShownPair(currentPair);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Update available</DialogTitle>
          <DialogDescription>
            This DevGuard instance runs version {instanceVersion}, but version{" "}
            {check.latestVersion} has been released. Ask your instance
            administrator to upgrade to get the latest features and security
            fixes.
          </DialogDescription>
          <Badge variant="yellow">{instanceVersion}</Badge>
          <Badge variant="success">{check.latestVersion}</Badge>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" asChild>
            <a href={check.latestUrl} target="_blank" rel="noopener noreferrer">
              View release notes
            </a>
          </Button>
          <DialogClose asChild>
            <Button>Got it</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
