"use client";

import { createContext, useContext } from "react";
import { OrganizationDetailsDTO } from "../types/api/api";
import { WithUpdater } from "./ClientContextWrapper";
import { ContentTreeElement } from "../utils/view";

const OrganizationContext = createContext<
  WithUpdater<{
    organization: OrganizationDetailsDTO | { oauth2Error: boolean } | null;
    contentTree: ContentTreeElement[];
  }>
>({
  v: {
    organization: null,
    contentTree: [],
  },
  update: () => {},
});

export const OrganizationProvider = OrganizationContext.Provider;
export const useOrganization = () => useContext(OrganizationContext).v;

export const useUpdateOrganization = () =>
  useContext(OrganizationContext).update;

export const isOrganization = (
  org: OrganizationDetailsDTO | { oauth2Error: boolean } | null,
): org is OrganizationDetailsDTO => {
  if (!org) return false;
  // oauth2Error is only present in case of an error
  if ("oauth2Error" in org) return false;
  return true;
};
