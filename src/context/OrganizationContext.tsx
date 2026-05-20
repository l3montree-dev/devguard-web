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
  organization: OrganizationDetailsDTO | { oauth2Error: boolean } | null;
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
    if (isOrganization(org) && org.id !== "" && org.slug !== "/") {
      localStorage.setItem("lastActiveOrg", org.slug);
    }
  }, [props.value.v.organization]);
  return <OrganizationContext.Provider {...props} />;
};
export const useOrganization = () => useContext(OrganizationContext).v;

export const useUpdateOrganization = () => {
  const { update } = useContext(OrganizationContext);
  return (
    params: OrgContextParams | ((prev: OrgContextParams) => OrgContextParams),
  ) => {
    if (typeof params !== "function") {
      if (isOrganization(params.organization))
        localStorage.setItem("lastActiveOrg", params.organization.slug);
      update(params);
    } else {
      update((prev) => {
        const newParams = params(prev);
        if (isOrganization(newParams.organization)) {
          localStorage.setItem("lastActiveOrg", newParams.organization.slug);
        }
        return newParams;
      });
    }
  };
};

export const isOrganization = (
  org: OrganizationDetailsDTO | { oauth2Error: boolean } | null,
): org is OrganizationDetailsDTO => {
  if (!org) return false;
  // oauth2Error is only present in case of an error
  if ("oauth2Error" in org) return false;
  return true;
};
