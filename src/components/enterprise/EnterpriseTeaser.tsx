// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { useConfig } from "@/context/ConfigContext";
import { useIsSelfHosted } from "@/hooks/useIsSelfHosted";
import { readLocalStorage, writeLocalStorage } from "@/hooks/useLocalStorage";
import { ShieldCheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useSyncExternalStore } from "react";
import { Button } from "../ui/button";

const STORAGE_KEY = "devguard:enterpriseTeaserDismissed";

const subscribe = () => () => {};
const getStoredDismissed = () => readLocalStorage(STORAGE_KEY) === "true";
const getServerDismissed = () => true;

export default function EnterpriseTeaser() {
  const { enterpriseUrl } = useConfig();
  const isSelfHosted = useIsSelfHosted();
  const storedDismissed = useSyncExternalStore(
    subscribe,
    getStoredDismissed,
    getServerDismissed,
  );
  const [dismissed, setDismissed] = useState(false);

  const dismiss = () => {
    writeLocalStorage(STORAGE_KEY, "true");
    setDismissed(true);
  };

  if (!isSelfHosted || storedDismissed || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 w-72 rounded-lg border border-border bg-card p-4 text-card-foreground">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <ShieldCheckIcon className="h-4 w-4" />
          DevGuard Enterprise
        </span>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss enterprise teaser"
          className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
      <p className="mb-4 text-sm">
        Running DevGuard yourself? <br />
        Get dedicated support, SLAs and enterprise maintenance.
      </p>
      <Button asChild size="xs" variant="secondary">
        <a
          href={enterpriseUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-umami-event="Enterprise Teaser"
        >
          Learn more
        </a>
      </Button>
    </div>
  );
}
