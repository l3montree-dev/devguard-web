// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";
import React from "react";
import type { User } from "../types/auth";
import type { OrganizationDTO } from "../types/api/api";
import { NoopUpdater } from "./ClientContextWrapper";
import type { WithUpdater } from "./ClientContextWrapper";

const SessionContext = React.createContext<
  WithUpdater<{
    session: {
      identity: User;
    } | null;
    organizations: OrganizationDTO[];
  }>
>({
  v: {
    session: null,
    organizations: [],
  },
  update: NoopUpdater,
});

export const SessionProvider = SessionContext.Provider;
export const useSession = () => React.useContext(SessionContext).v;
export const useUpdateSession = () => React.useContext(SessionContext).update;
