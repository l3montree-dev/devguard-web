// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import CompliancePosturesListView from "@/components/compliance-posturers/CompliancePosturesListView";
import { useProjectMenu } from "@/hooks/useProjectMenu";
import useDecodedParams from "@/hooks/useDecodedParams";
import { useActiveProject } from "@/hooks/useActiveProject";

const Index = () => {
  const { organizationSlug, projectSlug } = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
  };

  const projectMenu = useProjectMenu();
  const project = useActiveProject();
  const projectName = project.name;

  const scope = {
    level: "project",
    organization: organizationSlug,
    projectSlug,
  } as const;

  return (
    <CompliancePosturesListView
      scope={scope}
      Menu={projectMenu}
      contextName={projectName}
    />
  );
};

export default Index;
