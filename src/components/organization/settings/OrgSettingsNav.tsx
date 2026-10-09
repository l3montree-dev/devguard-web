// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import SettingsNav, {
  type SettingsNavGroup,
} from "@/components/common/settings/SettingsNav";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import {
  Blocks,
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
      {
        title: "Third-party integrations",
        segment: "integrations",
        Icon: Blocks,
        tour: "third-party-integrations",
      },
      {
        title: "Webhooks",
        segment: "webhooks",
        Icon: Webhook,
        tour: "webhook",
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      {
        title: "Configuration files",
        segment: "config",
        Icon: FileCog,
        tour: "config-file",
      },
      {
        title: "Dependency proxy",
        segment: "dependency-proxy",
        Icon: Package,
        tour: "dependency-proxy",
      },
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
        tour: "visibility",
        destructive: true,
      },
    ],
  },
];

const OrgSettingsNav = () => {
  const { slug } = useActiveOrg();

  return <SettingsNav base={`/${slug}/settings`} groups={groups} />;
};

export default OrgSettingsNav;
