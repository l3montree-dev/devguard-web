// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "devguard-admin-key";
const EXPIRES_KEY = "devguard-admin-expires-at";
const SESSION_DURATION_MS = 10 * 60 * 1000;

interface InstanceAdminContextValue {
  /** Whether the admin private key is currently stored in session storage. */
  isAuthenticated: boolean;
  /** Store the hex-encoded private key in session storage. */
  authenticate: (hexPrivateKey: string) => void;
  /** Remove the stored private key from session storage. */
  logout: () => void;
  /** Retrieve the stored hex-encoded private key. Returns null if not set. */
  getPrivateKey: () => string | null;
  /** Absolute timestamp (ms) when the admin session is auto-cleared. */
  expiresAt: number | null;
}

const InstanceAdminContext = createContext<InstanceAdminContextValue>({
  isAuthenticated: false,
  authenticate: () => {},
  logout: () => {},
  getPrivateKey: () => null,
  expiresAt: null,
});

interface AdminAuthState {
  isAuthenticated: boolean;
  expiresAt: number | null;
}

function readInitialState(): AdminAuthState {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, expiresAt: null };
  }
  const key = sessionStorage.getItem(STORAGE_KEY);
  if (!key) return { isAuthenticated: false, expiresAt: null };
  const rawExpires = sessionStorage.getItem(EXPIRES_KEY);
  const expiresAt = rawExpires ? Number(rawExpires) : NaN;
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(EXPIRES_KEY);
    return { isAuthenticated: false, expiresAt: null };
  }
  return { isAuthenticated: true, expiresAt };
}

export function InstanceAdminProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<AdminAuthState>(() => readInitialState());

  const authenticate = useCallback((hexPrivateKey: string) => {
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    sessionStorage.setItem(STORAGE_KEY, hexPrivateKey);
    sessionStorage.setItem(EXPIRES_KEY, String(expiresAt));
    setState({ isAuthenticated: true, expiresAt });
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(EXPIRES_KEY);
    setState({ isAuthenticated: false, expiresAt: null });
  }, []);

  const getPrivateKey = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (!state.expiresAt) return;
    const remaining = state.expiresAt - Date.now();
    if (remaining <= 0) {
      logout();
      return;
    }
    const id = setTimeout(logout, remaining);
    return () => clearTimeout(id);
  }, [state.expiresAt, logout]);

  return (
    <InstanceAdminContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        authenticate,
        logout,
        getPrivateKey,
        expiresAt: state.expiresAt,
      }}
    >
      {children}
    </InstanceAdminContext.Provider>
  );
}

export const useInstanceAdmin = () => useContext(InstanceAdminContext);

export function SessionCountdown() {
  const { expiresAt } = useInstanceAdmin();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  if (!expiresAt) return null;
  const remaining = Math.max(0, expiresAt - now);
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return (
    <p className="text-xs text-muted-foreground tabular-nums">
      Auto-logout in {minutes}:{String(seconds).padStart(2, "0")}
    </p>
  );
}
