"use client";

import { ReactNode, ComponentType } from "react";

interface ClientContextWrapperProps<T = any> {
  children: ReactNode;
  Provider: ComponentType<{ value: T; children: ReactNode }>;
  value: T;
}

export function ClientContextWrapper<T>({
  children,
  Provider,
  value,
}: ClientContextWrapperProps<T>) {
  return <Provider value={value}>{children}</Provider>;
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
