// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { ViewMode } from "@/types/view/navigation";
import { useLocalStorage } from "./useLocalStorage";

const DEFAULT_MODE: ViewMode = "risk";

export const useViewMode = (
  storageKey: string = "devguard-view-mode",
): [ViewMode, (mode: ViewMode) => void] => {
  const [mode, setMode] = useLocalStorage(storageKey);
  return [(mode as ViewMode | null) ?? DEFAULT_MODE, setMode];
};
