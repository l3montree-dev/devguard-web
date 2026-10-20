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
import {
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

const SHOWN_PAIR_KEY = "devguard-update-dialog-shown";

export default function UpdateAvailableDialog() {
  const currentUser = useCurrentUser();
  const { data: info } = useApiQuery(currentUser ? "/info" : null);
  const instanceVersion = info?.build.version;

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
      <DialogContent className="max-w-md">
        <DialogHeader className="items-center text-center sm:text-center">
          <div className="flex h-12 w-12 items-center justify-center">
            <ArrowPathIcon className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle>A new DevGuard version is available</DialogTitle>
          <DialogDescription>
            Ask your instance administrator to upgrade to get the latest
            features and security fixes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-6 rounded-lg border bg-muted/50 px-4 py-5">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Your version
            </span>
            <Badge variant="yellow" className="font-mono text-sm">
              {instanceVersion}
            </Badge>
          </div>
          <ArrowRightIcon className="mt-6 h-4 w-5 shrink-0 text-muted-foreground" />
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Latest version
            </span>
            <Badge variant="success" className="font-mono text-sm">
              {check.latestVersion}
            </Badge>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="secondary" className="flex-1" asChild>
            <a href={check.latestUrl} target="_blank" rel="noopener noreferrer">
              View release notes
              <ArrowTopRightOnSquareIcon className="ml-2 h-4 w-4 -translate-y-0.25" />
            </a>
          </Button>
          <DialogClose asChild>
            <Button className="flex-1">Got it</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
