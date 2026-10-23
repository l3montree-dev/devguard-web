// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { useCallback, useEffect, useState } from "react";

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

export const useLocalStorage = (key: string) => {
  const [value, setValue] = useState<string | null>();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(readLocalStorage(key));
  }, [key]);

  const store = useCallback(
    (next: string) => {
      writeLocalStorage(key, next);
      setValue(next);
    },
    [key],
  );

  return [value, store] as const;
};
