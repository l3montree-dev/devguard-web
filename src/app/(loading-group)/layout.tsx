// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import RootHeader from "@/components/common/RootHeader";
import React from "react";

export default function Layout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RootHeader />
      {/* Left edge grid pattern */}
      <div className="pointer-events-none fixed inset-y-0 left-0 z-10 hidden w-8 border-r border-r-(--grid-line-color) bg-[repeating-linear-gradient(315deg,var(--grid-line-color)_0,var(--grid-line-color)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] sm:block" />
      {/* Right edge grid pattern */}
      <div className="pointer-events-none fixed inset-y-0 right-0 z-10 hidden w-8 border-l border-l-(--grid-line-color) bg-[repeating-linear-gradient(315deg,var(--grid-line-color)_0,var(--grid-line-color)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] sm:block" />
      <div className="pt-[112px]">{children}</div>
    </>
  );
}
