// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import SettingsNav, {
  type SettingsNavGroup,
} from "@/components/common/settings/SettingsNav";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useAssetScope } from "@/hooks/useAssetScope";
import {
  Bug,
  FileCog,
  FolderGit2,
  KeyRound,
  Package,
  ScrollText,
  Settings,
  ShieldCheck,
  TriangleAlert,
  Users,
  Webhook,
  Workflow,
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
    title: "Security",
    items: [
      {
        title: "Security requirements",
        segment: "security-requirements",
        Icon: ShieldCheck,
      },
      {
        title: "Vulnerability management",
        segment: "vulnerability-management",
        Icon: Bug,
        tour: "repo-settings-vuln-management",
      },
    ],
  },
  {
    title: "Integrations",
    items: [
      { title: "Repository", segment: "repository", Icon: FolderGit2 },
      { title: "CI/CD", segment: "ci-cd", Icon: Workflow },
      {
        title: "Webhooks",
        segment: "webhooks",
        Icon: Webhook,
        tour: "repo-settings-webhook",
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
        tour: "repo-settings-config-files",
      },
      {
        title: "Dependency proxy",
        segment: "dependency-proxy",
        Icon: Package,
        tour: "repo-settings-dependency-proxy",
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
        tour: "repo-settings-danger",
        destructive: true,
      },
    ],
  },
];

const syncedHidden = ["members", "repository"];

const AssetSettingsNav = () => {
  const isSynced = Boolean(useActiveAsset()!.externalEntityProviderId);
  const { organization, projectSlug, assetSlug } = useAssetScope();

  return (
    <SettingsNav
      tour="repo-settings-header"
      base={`/${organization}/projects/${projectSlug}/assets/${assetSlug}/settings`}
      groups={groups}
      hidden={isSynced ? syncedHidden : undefined}
    />
  );
};

export default AssetSettingsNav;
