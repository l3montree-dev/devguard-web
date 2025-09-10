"use client";

import React from "react";
import { OrganizationDetailsDTO } from "../types/api/api";
import { ContentTreeElement } from "../zustand/globalStore";

const OrganizationContext = React.createContext<{
  organization: OrganizationDetailsDTO | { oauth2Error: boolean } | null;
  contentTree: ContentTreeElement;
}>(null as any);

export const OrganizationProvider = OrganizationContext.Provider;
export const useOrganization = () => React.useContext(OrganizationContext);
