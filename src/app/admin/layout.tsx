// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React from "react";
import RootHeader from "@/components/common/RootHeader";
import { InstanceAdminProvider } from "@/context/InstanceAdminContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InstanceAdminProvider>
      <RootHeader />
      <div className="pt-[112px]">{children}</div>
    </InstanceAdminProvider>
  );
}
