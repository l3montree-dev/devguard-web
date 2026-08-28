"use client";

import { useState } from "react";
import type { ReactNode, ComponentType } from "react";

export type WithUpdater<T> = { v: T } & {
  update: (newValue: T | ((prev: T) => T)) => void;
};

export const NoopUpdater = () => {};
interface ClientContextWrapperProps<T = any> {
  children: ReactNode;
  Provider: ComponentType<{ value: WithUpdater<T>; children: ReactNode }>;
  value: Omit<T, "update">;
}

export function ClientContextWrapper<T>({
  children,
  Provider,
  value,
}: ClientContextWrapperProps<T>) {
  const [state, update] = useState(value);

  return (
    <Provider
      value={
        {
          v: state as T,
          update,
        } as WithUpdater<T>
      }
    >
      {children}
    </Provider>
  );
}
