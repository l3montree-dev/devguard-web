import "@/styles/tailwind.scss";
import "focus-visible";

import { ThemeProvider } from "next-themes";
import { Inter, Lexend, Merriweather } from "next/font/google";
import React from "react";
import { withSession } from "../data-fetcher/fetchSession";
import { ClientContextWrapper } from "../context/ClientContextWrapper";
import { SessionProvider } from "../context/SessionContext";
import { withOrgs } from "../data-fetcher/fetchOrgs";
import { HttpError } from "../data-fetcher/http-error";
import { redirect } from "next/navigation";
import { ConfigProvider } from "../context/ConfigContext";
import { config } from "../config";

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
    const [session, orgs] = await Promise.all([withSession(), withOrgs()]);

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
    if (
      error instanceof HttpError &&
      error.instructions &&
      "redirect" in error.instructions
    ) {
      redirect(error.instructions.redirect.destination);
    }
  }
}
