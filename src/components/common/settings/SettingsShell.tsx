// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { PropsWithChildren, ReactNode } from "react";

const SettingsShell = ({
  nav,
  children,
}: PropsWithChildren<{ nav: ReactNode }>) => (
  <div className="flex flex-col gap-8 md:flex-row">
    <aside className="shrink-0 md:w-60">{nav}</aside>
    <div className="min-w-0 flex-1">{children}</div>
  </div>
);

export default SettingsShell;
