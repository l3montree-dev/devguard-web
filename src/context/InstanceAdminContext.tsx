// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

const STORAGE_KEY = "devguard-admin-key";

interface InstanceAdminContextValue {
  /** Whether the admin private key is currently stored in session storage. */
  isAuthenticated: boolean;
  /** Store the hex-encoded private key in session storage. */
  authenticate: (hexPrivateKey: string) => void;
  /** Remove the stored private key from session storage. */
  logout: () => void;
  /** Retrieve the stored hex-encoded private key. Returns null if not set. */
  getPrivateKey: () => string | null;
}

const InstanceAdminContext = createContext<InstanceAdminContextValue>({
  isAuthenticated: false,
  authenticate: () => {},
  logout: () => {},
  getPrivateKey: () => null,
});

export function InstanceAdminProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(STORAGE_KEY) !== null;
  });

  const authenticate = useCallback((hexPrivateKey: string) => {
    sessionStorage.setItem(STORAGE_KEY, hexPrivateKey);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
  }, []);

  const getPrivateKey = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(STORAGE_KEY);
  }, []);

  return (
    <InstanceAdminContext.Provider
      value={{ isAuthenticated, authenticate, logout, getPrivateKey }}
    >
      {children}
    </InstanceAdminContext.Provider>
  );
}

export const useInstanceAdmin = () => useContext(InstanceAdminContext);
