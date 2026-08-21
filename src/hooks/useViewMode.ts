// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useState, useEffect } from "react";

type ViewMode = "risk" | "cvss";

export const useViewMode = (
  storageKey: string = "devguard-view-mode",
): [ViewMode, (mode: ViewMode) => void] => {
  const [mode, setMode] = useState<ViewMode>("risk");

  const updateLocalStorage = (newMode: ViewMode) => {
    localStorage.setItem(storageKey, newMode);
  };

  useEffect(() => {
    const storedMode = localStorage.getItem(storageKey) as ViewMode;

    if (storedMode) {
      setMode(storedMode);
    }
  }, [storageKey]);

  return [
    mode,
    (m) => {
      updateLocalStorage(m);
      setMode(m);
    },
  ];
};
