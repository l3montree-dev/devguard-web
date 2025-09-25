"use client";
import React from "react";
import { User } from "../types/auth";
import { OrganizationDTO } from "../types/api/api";
import { WithUpdater } from "./ClientContextWrapper";

const SessionContext = React.createContext<
  WithUpdater<{
    session: {
      identity: User;
    } | null;
    organizations: OrganizationDTO[];
  }>
>({
  session: null,
  organizations: [],
  update: () => {},
});

export const SessionProvider = SessionContext.Provider;
export const useSession = () => React.useContext(SessionContext);
