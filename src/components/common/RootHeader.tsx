// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
"use client";

import {
  ArrowRightEndOnRectangleIcon,
  CogIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import DynamicHeader from "./DynamicHeader";

export default function RootHeader() {
  return (
    <DynamicHeader
      z={1}
      Title={null}
      menu={[
        {
          title: "Create Organization",
          href: "/setup",
          Icon: PlusIcon,
        },
        {
          title: "Join Organization",
          href: "/join",
          Icon: ArrowRightEndOnRectangleIcon,
        },
        {
          title: "User-Settings",
          href: "/user-settings",
          Icon: CogIcon,
        },
      ]}
    />
  );
}
