"use client";

import { ReactNode, ComponentType, useState } from "react";

export type WithUpdater<T> = { v: T } & {
  update: (newValue: T | ((prev: T) => T)) => void;
};

export type WithoutUpdater<T> = Omit<T, "update">;

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

export type ProviderValue<T> =
  T extends ComponentType<{ value: infer V; children: ReactNode }> ? V : never;

export interface ProviderConfig<T = any> {
  Provider: ComponentType<{ value: T; children: ReactNode }>;
  value: T;
}

export function MultiContextWrapper({
  children,
  providers,
}: {
  children: ReactNode;
  providers: ProviderConfig[];
}) {
  return providers.reduceRight(
    (acc, { Provider, value }) => <Provider value={value}>{acc}</Provider>,
    children,
  );
}
