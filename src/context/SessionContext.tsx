"use client";
import React from "react";
import { User } from "../types/auth";
import { OrganizationDTO } from "../types/api/api";

const SessionContext = React.createContext<{
  session: {
    identity: User;
  } | null;
  organizations: OrganizationDTO[];
}>({
  session: null,
  organizations: [],
});
export const SessionProvider = SessionContext.Provider;
export const useSession = () => React.useContext(SessionContext);
