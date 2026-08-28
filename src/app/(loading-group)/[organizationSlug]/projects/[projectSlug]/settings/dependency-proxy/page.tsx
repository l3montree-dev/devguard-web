// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import Page from "@/components/Page";
import DependencyProxyConfigs from "@/components/common/DependencyProxyConfigs";
import ProjectTitle from "@/components/common/ProjectTitle";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useProjectMenu } from "@/hooks/useProjectMenu";

const Config = () => {
  const org = useActiveOrg();
  const project = useActiveProject();
  const projectMenu = useProjectMenu();

  const scope =
    org && project
      ? ({
          level: "project",
          organization: org.slug,
          projectSlug: project.slug,
        } as const)
      : null;

  return (
    <Page
      breadcrumbs={[
        {
          title: "Settings",
          href: "./",
        },
        {
          title: "Dependency Proxy",
          href: "",
        },
      ]}
      title={""}
      Menu={projectMenu}
      Title={<ProjectTitle />}
    >
      <DependencyProxyConfigs scope={scope} />
    </Page>
  );
};

export default Config;
