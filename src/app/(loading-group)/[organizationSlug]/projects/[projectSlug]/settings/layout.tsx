// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Page from "@/components/Page";
import ProjectTitle from "@/components/common/ProjectTitle";
import SettingsShell from "@/components/common/settings/SettingsShell";
import ProjectSettingsNav from "@/components/project/settings/ProjectSettingsNav";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useProjectMenu } from "@/hooks/useProjectMenu";
import { isAdmin, useCurrentUserRole } from "@/hooks/useUserRole";
import { useRouter } from "next/navigation";
import { type PropsWithChildren, useEffect } from "react";

export default function ProjectSettingsLayout({ children }: PropsWithChildren) {
  const projectMenu = useProjectMenu();
  const project = useActiveProject()!;
  const { slug } = useActiveOrg();
  const role = useCurrentUserRole();
  const router = useRouter();
  const allowed = isAdmin(role);

  useEffect(() => {
    if (!allowed) {
      router.replace(`/${slug}`);
    }
  }, [allowed, router, slug]);

  return (
    <Page
      title={"Settings (" + project.name + ")"}
      Menu={projectMenu}
      Title={<ProjectTitle />}
    >
      <SettingsShell nav={<ProjectSettingsNav />}>{children}</SettingsShell>
    </Page>
  );
}
