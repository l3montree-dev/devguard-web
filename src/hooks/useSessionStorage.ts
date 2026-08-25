// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { useCallback, useState } from "react";

export const readSessionStorage = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    console.error(`cannot read sessionStorage key ${key}`, error);
    return null;
  }
};

export const writeSessionStorage = (key: string, value: string) => {
  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
    console.error(`cannot write sessionStorage key ${key}`, error);
  }
};

export const removeSessionStorage = (key: string) => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`cannot remove sessionStorage key ${key}`, error);
  }
};

export const useSessionStorage = (key: string) => {
  const [value, setValue] = useState(() => readSessionStorage(key));

  const store = useCallback(
    (next: string) => {
      writeSessionStorage(key, next);
      setValue(next);
    },
    [key],
  );

  return [value, store] as const;
};
