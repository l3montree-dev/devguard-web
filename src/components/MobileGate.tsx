// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import React from "react";
import NotSupported from "@/components/NotSupported";

export default function MobileGate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="contents max-md:hidden">{children}</div>
      <div className="hidden max-md:block">
        <NotSupported />
      </div>
    </>
  );
}
