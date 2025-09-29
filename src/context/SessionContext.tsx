"use client";
import React from "react";
import { User } from "../types/auth";
import { OrganizationDTO } from "../types/api/api";
import { NoopUpdater, WithUpdater } from "./ClientContextWrapper";

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
