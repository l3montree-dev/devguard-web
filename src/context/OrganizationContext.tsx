"use client";

import { createContext, useContext } from "react";
import { OrganizationDetailsDTO } from "../types/api/api";
import { ContentTreeElement } from "../zustand/globalStore";
import { WithUpdater } from "./ClientContextWrapper";

const OrganizationContext = createContext<
  WithUpdater<{
    organization: OrganizationDetailsDTO | { oauth2Error: boolean } | null;
    contentTree: ContentTreeElement[];
  }>
>({
  organization: null,
  contentTree: [],
  update: () => {},
});

export const OrganizationProvider = OrganizationContext.Provider;
export const useOrganization = () => useContext(OrganizationContext);

export const isOrganization = (
  org: OrganizationDetailsDTO | { oauth2Error: boolean } | null,
): org is OrganizationDetailsDTO => {
  if (!org) return false;
  // oauth2Error is only present in case of an error
  if ("oauth2Error" in org) return false;
  return true;
};
