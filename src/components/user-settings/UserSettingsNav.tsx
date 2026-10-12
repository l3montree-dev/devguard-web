// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import SettingsNav, {
  type SettingsNavGroup,
} from "@/components/common/settings/SettingsNav";
import { KeyRound, TriangleAlert, UserRound } from "lucide-react";

const groups: SettingsNavGroup[] = [
  { items: [{ title: "Account", segment: "", Icon: UserRound }] },
  {
    title: "Access",
    items: [
      { title: "Access tokens", segment: "access-tokens", Icon: KeyRound },
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

const UserSettingsNav = () => (
  <SettingsNav base="/user-settings" groups={groups} />
);

export default UserSettingsNav;
