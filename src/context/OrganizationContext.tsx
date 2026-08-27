// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import {
  createContext,
  useContext,
  useEffect,
  type ProviderProps,
} from "react";
import type { WithUpdater } from "@/types/view/context";

import type { OrgContextParams } from "@/types/view/context";
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
