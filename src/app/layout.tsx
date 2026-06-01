import "@/styles/tailwind.scss";
import "focus-visible";

import { ThemeProvider } from "next-themes";
import localFont from "next/font/local";
import React, { Suspense } from "react";
import { Toaster } from "sonner";
import { config } from "../config";
import MobileGate from "@/components/MobileGate";
import { CSSVariableEditor } from "@/components/themes/CSSVariableEditor";
import { ClientContextWrapper } from "../context/ClientContextWrapper";
import { ConfigProvider } from "../context/ConfigContext";
import { SessionProvider } from "../context/SessionContext";
import { fetchOrgs } from "../data-fetcher/fetchOrgs";
import { fetchSession } from "../data-fetcher/fetchSession";
import type { OrganizationDTO } from "../types/api/api";
import InternalServerErrorPage from "./error";
import { TourContextProvider } from "@/context/TourContext";

export const lexend = localFont({
  src: "../../public/fonts/Lexend/Lexend-VariableFont_wght.ttf",
  display: "swap",
  variable: "--font-lexend",
});

export const inter = localFont({
  src: "../../public/fonts/Inter-VariableFont_opsz,wght.ttf",
  display: "swap",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          forcedTheme={config?.enforceTheme ? config.enforceTheme : undefined}
          enableSystem
          disableTransitionOnChange
        >
          <ClientContextWrapper Provider={ConfigProvider} value={config}>
            <Suspense>
              <SessionShell>{children}</SessionShell>
            </Suspense>
          </ClientContextWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

async function  SessionShell({ children }: { children: React.ReactNode }) {
  try {
    const session = await fetchSession();
    let orgs: OrganizationDTO[] = [];
    if (session) {
      orgs = await fetchOrgs();
    }

    return (
      <ClientContextWrapper
        Provider={SessionProvider}
        value={{
          session,
          organizations: orgs,
        }}
      >
        <TourContextProvider>
          <MobileGate>{children}</MobileGate>
          <Toaster />
          {process.env.NODE_ENV === "development" && <CSSVariableEditor />}
        </TourContextProvider>
      </ClientContextWrapper>
    );
  } catch (error) {
    return (
      <MobileGate>
        <InternalServerErrorPage error={error as Error} />
      </MobileGate>
    );
  }
}
