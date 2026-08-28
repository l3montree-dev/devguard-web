// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import "@/styles/tailwind.scss";
import "focus-visible";

import { ThemeProvider } from "next-themes";
import localFont from "next/font/local";
import { connection } from "next/server";
import React, { Suspense } from "react";
import HashScroll from "@/components/HashScroll";
import { Toaster } from "@/components/ui/sonner";
import { config } from "../config";
import MobileGate from "@/components/MobileGate";
import { CSSVariableEditor } from "@/components/themes/CSSVariableEditor";
import { ClientContextWrapper } from "../context/ClientContextWrapper";
import { ConfigProvider } from "../context/ConfigContext";
import { SessionProvider } from "../context/SessionContext";
import { fetchInstanceSettings } from "../data-fetcher/fetchInstanceSettings";
import { fetchOrgs } from "../data-fetcher/fetchOrgs";
import { fetchSession } from "../data-fetcher/fetchSession";
import type { OrganizationDTO } from "../types/api/api";
import InternalServerErrorPage from "./error";
import { TourContextProvider } from "@/context/TourContext";

export const lexend = localFont({
  src: "../../public/fonts/Lexend/Lexend-VariableFont_wght.ttf",
  display: "swap",
  preload: false,
  variable: "--font-lexend",
});

export const inter = localFont({
  src: "../../public/fonts/Inter-VariableFont_opsz,wght.ttf",
  display: "swap",
  preload: false,
  variable: "--font-inter",
});

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={
        "h-full scroll-smooth antialiased " +
        lexend.className +
        " " +
        inter.className
      }
      lang="en"
    >
      <body
        suppressHydrationWarning
        className={
          "flex min-h-full flex-col " + inter.variable + " " + lexend.variable
        }
      >
        {/* Restores CSS variable overrides before first paint — dev only */}
        {/*process.env.NODE_ENV === "development" && (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script src="/dev-theme-init.js" />
        )*/}
        <Suspense fallback={null}>
          <RuntimeEnvTags />
        </Suspense>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          forcedTheme={config?.enforceTheme ? config.enforceTheme : undefined}
          enableSystem
          disableTransitionOnChange
        >
          <Suspense>
            <SessionShell>{children}</SessionShell>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}

// envs are empty during `next build` - with cacheComponents
// is prerendered at build time, but have to render at
// request time — otherwise hydration fails.
async function RuntimeEnvTags() {
  await connection();

  return (
    <>
      {config.theme.cssUrl && (
        <link rel="stylesheet" href={config.theme.cssUrl} />
      )}
      {config.theme.jsUrl && (
        <script
          defer
          src={config.theme.jsUrl}
          {...(config.theme.jsIntegrity && {
            integrity: config.theme.jsIntegrity,
            crossOrigin: "anonymous",
          })}
        ></script>
      )}
      {config.analytics.scriptUrl && config.analytics.websiteId && (
        <script
          defer
          src={config.analytics.scriptUrl}
          data-website-id={config.analytics.websiteId}
          {...(config.analytics.integrity && {
            integrity: config.analytics.integrity,
            crossOrigin: "anonymous",
          })}
        />
      )}
    </>
  );
}

async function SessionShell({ children }: { children: React.ReactNode }) {
  let session: Awaited<ReturnType<typeof fetchSession>>;
  let orgs: OrganizationDTO[] = [];
  let instanceSettings: Awaited<ReturnType<typeof fetchInstanceSettings>> = {};

  try {
    [session, instanceSettings] = await Promise.all([
      fetchSession(),
      fetchInstanceSettings(),
    ]);
    if (session) {
      orgs = await fetchOrgs();
    }
  } catch (error) {
    return (
      <MobileGate>
        <InternalServerErrorPage error={error as Error} />
      </MobileGate>
    );
  }

  return (
    <ClientContextWrapper
      Provider={ConfigProvider}
      value={{ ...config, ...instanceSettings }}
    >
      <ClientContextWrapper
        Provider={SessionProvider}
        value={{
          session,
          organizations: orgs,
        }}
      >
        <HashScroll />
        <TourContextProvider>
          <MobileGate>{children}</MobileGate>
          <Toaster />
          {process.env.NODE_ENV === "development" && <CSSVariableEditor />}
        </TourContextProvider>
      </ClientContextWrapper>
    </ClientContextWrapper>
  );
}
