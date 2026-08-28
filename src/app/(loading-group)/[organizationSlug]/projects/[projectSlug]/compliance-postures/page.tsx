// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import CompliancePosturesListView from "@/components/compliance-posturers/CompliancePosturesListView";
import { useProjectMenu } from "@/hooks/useProjectMenu";
import useDecodedParams from "@/hooks/useDecodedParams";

const Index = () => {
  const { organizationSlug, projectSlug } = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
  };

  const projectMenu = useProjectMenu();

  const apiBaseUrl =
    "/organizations/" +
    organizationSlug +
    "/projects/" +
    projectSlug +
    "/compliance-postures/";

  return (
    <CompliancePosturesListView apiBaseUrl={apiBaseUrl} Menu={projectMenu} />
  );
};

export default Index;
