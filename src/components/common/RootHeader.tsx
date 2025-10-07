// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
"use client";

import { CogIcon } from "@heroicons/react/24/outline";
import DynamicHeader from "./DynamicHeader";

export default function RootHeader() {
  return (
    <DynamicHeader
      z={1}
      Title={null}
      menu={[
        {
          title: "User-Settings",
          href: "/user-settings",
          Icon: CogIcon,
        },
      ]}
    />
  );
}
