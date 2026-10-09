// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import SettingsNav, {
  type SettingsNavGroup,
} from "@/components/common/settings/SettingsNav";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useProjectScope } from "@/hooks/useProjectScope";
import {
  Cable,
  FileCog,
  KeyRound,
  Package,
  ScrollText,
  Settings,
  TriangleAlert,
  Users,
  Webhook,
} from "lucide-react";

const groups: SettingsNavGroup[] = [
  { items: [{ title: "General", segment: "", Icon: Settings }] },
  {
    title: "Access",
    items: [
      { title: "Members", segment: "members", Icon: Users },
      { title: "Access tokens", segment: "access-tokens", Icon: KeyRound },
    ],
  },
  {
    title: "Integrations",
    items: [
      { title: "Webhooks", segment: "webhooks", Icon: Webhook },
      { title: "External integrations", segment: "external", Icon: Cable },
    ],
  },
  {
    title: "Configuration",
    items: [
      { title: "Configuration files", segment: "config", Icon: FileCog },
      { title: "Dependency proxy", segment: "dependency-proxy", Icon: Package },
      { title: "Logs", segment: "logs", Icon: ScrollText },
    ],
  },
  {
    title: "Advanced",
    items: [
      {
        title: "Danger zone",
        segment: "danger-zone",
        Icon: TriangleAlert,
        destructive: true,
      },
    ],
  },
];

const syncedHidden = ["members"];

const ProjectSettingsNav = () => {
  const isSynced = Boolean(useActiveProject()!.externalEntityProviderId);
  const { organization, projectSlug } = useProjectScope();

  return (
    <SettingsNav
      base={`/${organization}/projects/${projectSlug}/settings`}
      groups={groups}
      hidden={isSynced ? syncedHidden : undefined}
    />
  );
};

export default ProjectSettingsNav;
