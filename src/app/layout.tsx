import "@/styles/tailwind.scss";
import "focus-visible";

import { ThemeProvider } from "next-themes";
import { Inter, Lexend, Merriweather } from "next/font/google";
import { redirect } from "next/navigation";
import React from "react";
import { config } from "../config";
import { ClientContextWrapper } from "../context/ClientContextWrapper";
import { ConfigProvider } from "../context/ConfigContext";
import { SessionProvider } from "../context/SessionContext";
import { fetchOrgs } from "../data-fetcher/fetchOrgs";
import { fetchSession } from "../data-fetcher/fetchSession";
import { HttpError } from "../data-fetcher/http-error";
import InternalServerErrorPage from "./error";
import { OrganizationDTO } from "../types/api/api";

export const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lexend",
});

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const merriweather = Merriweather({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-merriweather",
  weight: "700",
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
            "flex min-h-full flex-col " +
            inter.variable +
            " " +
            lexend.variable +
            " " +
            merriweather.variable
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
            "flex min-h-full flex-col " +
            inter.variable +
            " " +
            lexend.variable +
            " " +
            merriweather.variable
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
          </ThemeProvider>
        </body>
      </html>
    );
  }
}
