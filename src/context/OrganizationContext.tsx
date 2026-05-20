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
    console.log(
      "last active org in update organization before update",
      localStorage.getItem("lastActiveOrg"),
    );
    if (typeof params !== "function") {
      console.log("updating organization with params");
      if (isOrganization(params.organization)) {
        console.log(
          "updating organization with slug",
          params.organization.slug,
        );
        localStorage.setItem("lastActiveOrg", params.organization.slug);
        update(params);
      }
    } else {
      console.log("updating organization with function");
      update((prev) => {
        const newParams = params(prev);
        if (isOrganization(newParams.organization)) {
          console.log(
            "updating organization with slug",
            newParams.organization.slug,
          );
          localStorage.setItem("lastActiveOrg", newParams.organization.slug);
        }
        return newParams;
      });
    }
    console.log(
      "last active org in update organization after update",
      localStorage.getItem("lastActiveOrg"),
    );
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
