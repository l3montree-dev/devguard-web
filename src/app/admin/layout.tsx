// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React from "react";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import RootHeader from "@/components/common/RootHeader";
import { InstanceAdminProvider } from "@/context/InstanceAdminContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InstanceAdminProvider>
      <TooltipProvider delayDuration={100}>
        <RootHeader />
       {/* Left edge grid pattern */}
      <div className="pointer-events-none fixed inset-y-0 left-0 z-10 hidden w-8 border-r border-r-[hsl(var(--grid-line-color))] bg-[repeating-linear-gradient(315deg,hsl(var(--grid-line-color))_0,hsl(var(--grid-line-color))_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] sm:block" />
      {/* Right edge grid pattern */}
      <div className="pointer-events-none fixed inset-y-0 right-0 z-10 hidden w-8 border-l border-l-[hsl(var(--grid-line-color))] bg-[repeating-linear-gradient(315deg,hsl(var(--grid-line-color))_0,hsl(var(--grid-line-color))_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] sm:block" />
        <div className="pt-[112px]">{children}</div>
      </TooltipProvider>
    </InstanceAdminProvider>
  );
}
