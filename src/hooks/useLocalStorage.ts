// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { useCallback, useSyncExternalStore } from "react";

export const readLocalStorage = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error("cannot read localStorage key", key, error);
    return null;
  }
};

export const writeLocalStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error("cannot write localStorage key", key, error);
  }
};

export const removeLocalStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("cannot remove localStorage key", key, error);
  }
};

// re-render callbacks of all mounted useLocalStorage hooks
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useLocalStorage = (key: string) => {
  // undefined on server and during hydration, the stored value afterwards
  const value = useSyncExternalStore(
    subscribe,
    () => readLocalStorage(key),
    () => undefined,
  );

  const store = useCallback(
    (next: string) => {
      writeLocalStorage(key, next);
      // localStorage has no change event in the same tab, so notify manually
      listeners.forEach((listener) => listener());
    },
    [key],
  );

  return [value, store] as const;
};
