// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
"use client";

import { CogIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useInstanceInfo } from "@/hooks/useInstanceSettings";
import DynamicHeader from "./DynamicHeader";

export default function RootHeader() {
  const instanceSettings = useInstanceInfo();

  const menu = [
    ...(!instanceSettings?.singleOrganizationMode
      ? [
          {
            title: "Add Organization",
            href: "/setup",
            Icon: PlusIcon,
          },
        ]
      : []),
    {
      title: "User-Settings",
      href: "/user-settings",
      Icon: CogIcon,
    },
  ];

  return <DynamicHeader z={1} Title={null} menu={menu} />;
}
