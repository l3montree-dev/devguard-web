"use client";

import type { ReactNode } from "react";
import { ClientContextWrapper } from "./ClientContextWrapper";
import { ConfigProvider } from "./ConfigContext";
import { config } from "../config";
import { useInstanceSettings } from "@/hooks/useInstanceSettings";

export function ConfigProviderWithInstanceSettings({
  children,
}: {
  children: ReactNode;
}) {
  const instanceSettings = useInstanceSettings();

  return (
    <ClientContextWrapper
      Provider={ConfigProvider}
      value={{ ...config, ...instanceSettings }}
    >
      {children}
    </ClientContextWrapper>
  );
}
