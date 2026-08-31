// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useCallback, useSyncExternalStore } from "react";

import type { ViewMode } from "@/types/view/navigation";
import { readLocalStorage, writeLocalStorage } from "./useLocalStorage";

const DEFAULT_MODE: ViewMode = "risk";

const listeners = new Set<() => void>();

const subscribe = (onStoreChange: () => void) => {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
};

const getServerSnapshot = () => DEFAULT_MODE;

export const useViewMode = (
  storageKey: string = "devguard-view-mode",
): [ViewMode, (mode: ViewMode) => void] => {
  const getSnapshot = useCallback(
    () => (readLocalStorage(storageKey) as ViewMode | null) ?? DEFAULT_MODE,
    [storageKey],
  );

  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setMode = useCallback(
    (m: ViewMode) => {
      writeLocalStorage(storageKey, m);
      listeners.forEach((notify) => notify());
    },
    [storageKey],
  );

  return [mode, setMode];
};
