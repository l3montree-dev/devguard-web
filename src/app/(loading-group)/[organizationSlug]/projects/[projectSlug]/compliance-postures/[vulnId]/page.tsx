// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import CompliancePostureDetailView from "@/components/compliance-posturers/CompliancePostureDetailView";
import { useProjectMenu } from "@/hooks/useProjectMenu";
import useDecodedParams from "@/hooks/useDecodedParams";

const Index = () => {
  const { organizationSlug, projectSlug, vulnId } = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    vulnId: string;
  };

  const projectMenu = useProjectMenu();

  const scope = {
    level: "project",
    organization: organizationSlug,
    projectSlug,
  } as const;

  return (
    <CompliancePostureDetailView
      scope={scope}
      vulnId={vulnId}
      Menu={projectMenu}
    />
  );
};

export default Index;
