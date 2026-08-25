// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { useState } from "react";
import { readLocalStorage, writeLocalStorage } from "./useLocalStorage";

const ALL_TOUR_KEYS = [
  "org-home",
  "org-settings",
  "org-overview",
  "group-home",
  "repo-home",
  "repo-settings",
  "dependency-risk",
  "dependency-insights",
] as const;

const storageKey = (tourKey: string) => `devguard:tourSeen:${tourKey}`;

export const dismissAllTours = () => {
  ALL_TOUR_KEYS.forEach((key) => {
    writeLocalStorage(storageKey(key), "true");
  });
};

export function useTourSeen(tourKey: string) {
  const key = storageKey(tourKey);

  const [showModal, setShowModal] = useState(() => {
    if (typeof window === "undefined") return false;
    return readLocalStorage(key) !== "true";
  });

  const markSeen = () => {
    writeLocalStorage(key, "true");
    setShowModal(false);
  };

  return { showModal, markSeen };
}
