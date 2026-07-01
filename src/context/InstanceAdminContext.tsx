// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { RefreshCw } from "lucide-react";

const SESSION_DURATION_MS = 10 * 60 * 1000;

interface InstanceAdminContextValue {
  /** Whether an admin signing key is currently held in memory. */
  isAuthenticated: boolean;
  /** Store the imported, non-extractable signing key in memory for this tab. */
  authenticate: (key: CryptoKey) => void;
  /** Drop the in-memory signing key. */
  logout: () => void;
  /** Reset the auto-logout timer back to the full session duration. */
  refreshSession: () => void;
  /** Retrieve the in-memory signing key. Returns null if not authenticated. */
  getSigningKey: () => CryptoKey | null;
  /** Absolute timestamp (ms) when the admin session is auto-cleared. */
  expiresAt: number | null;
}

const InstanceAdminContext = createContext<InstanceAdminContextValue>({
  isAuthenticated: false,
  authenticate: () => {},
  logout: () => {},
  refreshSession: () => {},
  getSigningKey: () => null,
  expiresAt: null,
});

interface AdminAuthState {
  isAuthenticated: boolean;
  expiresAt: number | null;
}

export function InstanceAdminProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // The signing key lives only in memory (never sessionStorage/localStorage),
  // is non-extractable, and does not survive a page reload — a deliberate
  // hardening tradeoff against key exfiltration via XSS.
  const keyRef = useRef<CryptoKey | null>(null);
  const [state, setState] = useState<AdminAuthState>({
    isAuthenticated: false,
    expiresAt: null,
  });

  const authenticate = useCallback((key: CryptoKey) => {
    keyRef.current = key;
    setState({
      isAuthenticated: true,
      expiresAt: Date.now() + SESSION_DURATION_MS,
    });
  }, []);

  const logout = useCallback(() => {
    keyRef.current = null;
    setState({ isAuthenticated: false, expiresAt: null });
  }, []);

  const refreshSession = useCallback(() => {
    if (!keyRef.current) return;
    setState((prev) => ({
      ...prev,
      expiresAt: Date.now() + SESSION_DURATION_MS,
    }));
  }, []);

  const getSigningKey = useCallback((): CryptoKey | null => {
    return keyRef.current;
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
        refreshSession,
        getSigningKey,
        expiresAt: state.expiresAt,
      }}
    >
      {children}
    </InstanceAdminContext.Provider>
  );
}

export const useInstanceAdmin = () => useContext(InstanceAdminContext);

export function SessionCountdown() {
  const { expiresAt, refreshSession } = useInstanceAdmin();
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
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
      Auto-logout in {minutes}:{String(seconds).padStart(2, "0")}
      <button
        type="button"
        onClick={refreshSession}
        className="inline-flex items-center gap-0.5 font-medium text-foreground underline-offset-2 hover:underline"
        title="Reset the auto-logout timer to 10 minutes"
      >
        <RefreshCw className="h-3 w-3" />
        Reset
      </button>
    </p>
  );
}
