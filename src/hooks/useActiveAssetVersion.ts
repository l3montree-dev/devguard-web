// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useMemo } from "react";
import { useAssetVersion } from "../context/AssetVersionContext";
import { useActiveAsset } from "./useActiveAsset";

export function useActiveAssetVersion() {
  return useAssetVersion();
}

export function useAssetBranchesAndTags() {
  const activeAsset = useActiveAsset();

  const branches = useMemo(() => {
    if (activeAsset) {
      return activeAsset.refs.filter((v) => v.type === "branch");
    }
    return [];
  }, [activeAsset]);

  const tags = useMemo(() => {
    if (activeAsset) {
      return activeAsset.refs.filter((v) => v.type === "tag");
    }
    return [];
  }, [activeAsset]);

  return { branches, tags };
}
