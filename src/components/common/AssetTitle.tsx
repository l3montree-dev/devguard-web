// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import useDecodedParams from "@/hooks/useDecodedParams";
import Link from "next/link";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { Badge } from "../ui/badge";
import ProjectTitle from "./ProjectTitle";
import { eventBus } from "@/events";
import { truncateMiddle } from "@/utils/common";
import { readLocalStorage, writeLocalStorage } from "@/hooks/useLocalStorage";

const subscribe = (onStoreChange: () => void) => {
  eventBus.subscribe(
    "assetTitleListener",
    "assetVersionDeleted",
    onStoreChange,
  );
  return () => {
    eventBus.unsubscribe("assetTitleListener");
  };
};

const getServerSnapshot = () => "";

const AssetTitle = () => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject()!;
  const asset = useActiveAsset();

  const params = useDecodedParams() as { assetVersionSlug?: string };
  const currentSlug = params?.assetVersionSlug;
  const storageKey = "lastViewedAssetVersionSlug" + asset?.slug;

  const getSnapshot = useCallback(() => {
    const stored = readLocalStorage(storageKey);
    return stored && stored !== "undefined" ? stored : "";
  }, [storageKey]);

  const storedSlug = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const assetVersionSlug = currentSlug ?? storedSlug;

  useEffect(() => {
    if (currentSlug) {
      writeLocalStorage(storageKey, currentSlug);
    }
  }, [currentSlug, storageKey]);

  return (
    <span className="flex flex-row gap-2 min-w-0 overflow-hidden">
      <ProjectTitle />
      <span className="opacity-75 flex-shrink-0">/</span>
      <Link
        className="flex !text-header-foreground items-center gap-1 hover:no-underline min-w-0"
        href={
          `/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}` +
          (assetVersionSlug && assetVersionSlug !== "undefined"
            ? `/refs/${assetVersionSlug}`
            : "")
        }
        title={asset?.name}
      >
        <span className="truncate">
          {asset?.name ? truncateMiddle(asset.name) : ""}
        </span>
        <Badge className="!text-header-foreground" variant="outline">
          Repository
        </Badge>
      </Link>
    </span>
  );
};

export default AssetTitle;
