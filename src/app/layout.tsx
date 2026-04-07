import "@/styles/tailwind.scss";
import "focus-visible";

import { ThemeProvider } from "next-themes";
import localFont from "next/font/local";
import React from "react";
import { Toaster } from "sonner";
import { config } from "../config";
import { ClientContextWrapper } from "../context/ClientContextWrapper";
import { ConfigProvider } from "../context/ConfigContext";
import { SessionProvider } from "../context/SessionContext";
import { fetchOrgs } from "../data-fetcher/fetchOrgs";
import { fetchSession } from "../data-fetcher/fetchSession";
import type { OrganizationDTO } from "../types/api/api";
import InternalServerErrorPage from "./error";

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

export default async function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const session = await fetchSession();
    let orgs: OrganizationDTO[] = [];
    if (session) {
      orgs = await fetchOrgs();
    }

    return (
      <html
        suppressHydrationWarning
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
          {config.themeCssUrl && (
            <link rel="stylesheet" href={config.themeCssUrl} />
          )}
          {config.themeJsUrl && <script src={config.themeJsUrl} defer></script>}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            forcedTheme={config?.enforceTheme ? config.enforceTheme : undefined}
            enableSystem
            disableTransitionOnChange
          >
            <ClientContextWrapper Provider={ConfigProvider} value={config}>
              <ClientContextWrapper
                Provider={SessionProvider}
                value={{
                  session,
                  organizations: orgs,
                }}
              >
                {children}
                <Toaster />
              </ClientContextWrapper>
            </ClientContextWrapper>
          </ThemeProvider>
        </body>
      </html>
    );
  } catch (error) {
    console.error("Error in RootLayout:", error);
    return (
      <html
        suppressHydrationWarning
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
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            forcedTheme={config?.enforceTheme ? config.enforceTheme : undefined}
            enableSystem
            disableTransitionOnChange
          >
            <InternalServerErrorPage error={error as Error} />
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    );
  }
}
