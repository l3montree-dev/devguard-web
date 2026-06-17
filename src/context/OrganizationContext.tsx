"use client";

import {
  createContext,
  useContext,
  useEffect,
  type ProviderProps,
} from "react";
import type { OrganizationDetailsDTO } from "../types/api/api";
import type { WithUpdater } from "./ClientContextWrapper";
import type { ContentTreeElement } from "../utils/view";

type OrgContextParams = {
  organization: OrganizationDetailsDTO | null;
  contentTree: ContentTreeElement[];
};
const OrganizationContext = createContext<WithUpdater<OrgContextParams>>({
  v: {
    organization: null,
    contentTree: [],
  },
  update: () => {},
});

export const OrganizationProvider = (
  props: ProviderProps<WithUpdater<OrgContextParams>>,
) => {
  useEffect(() => {
    const org = props.value.v.organization;
    if (org && org.id !== "" && org.slug !== "/") {
      localStorage.setItem("lastActiveOrg", org.slug);
    }
  }, [props.value.v.organization]);

  return <OrganizationContext.Provider {...props} />;
};
export const useOrganization = () => useContext(OrganizationContext).v;

export const useUpdateOrganization = () =>
  useContext(OrganizationContext).update;
