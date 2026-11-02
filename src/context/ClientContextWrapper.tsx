// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { useState } from "react";
import type { ReactNode, ComponentType } from "react";

import type { WithUpdater } from "@/types/view/context";

export const NoopUpdater = () => {};
interface ClientContextWrapperProps<T = any> {
  children: ReactNode;
  Context: ComponentType<{ value: WithUpdater<T>; children: ReactNode }>;
  value: Omit<T, "update">;
}

export function ClientContextWrapper<T>({
  children,
  Context,
  value,
}: ClientContextWrapperProps<T>) {
  const [state, update] = useState(value);

  return (
    <Context
      value={
        {
          v: state as T,
          update,
        } as WithUpdater<T>
      }
    >
      {children}
    </Context>
  );
}
