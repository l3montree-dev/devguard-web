// Copyright (C) 2023 Tim Bastin, Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { TooltipProvider } from "@/components/ui/tooltip";
import "@/styles/tailwind.scss";
import "focus-visible";
import { ThemeProvider } from "next-themes";
import { Inter, Lexend, Merriweather } from "next/font/google";
import { useEffect, useState } from "react";
import { StoreProvider } from "../zustand/globalStoreProvider";
import NotSupported from "./notsupported";
import useConfig from "../hooks/useConfig";
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

// @ts-ignore
export default function App({ Component, pageProps }) {
  return (
    <StoreProvider initialZustand={pageProps.initialZustand}>
      <AppTheme Component={Component} pageProps={pageProps} />
    </StoreProvider>
  );
}

const AppTheme = ({ Component, pageProps }: any) => {
  const [isMobile, setIsMobile] = useState(false);
  const c = useConfig() as typeof config | undefined;
  useEffect(() => {
    window.innerWidth < 768 && setIsMobile(true);

    // check if there are theming options in local storage
    const themeCssURL = localStorage.getItem("themeCssURL");
    const themeJsURL = localStorage.getItem("themeJsURL");
    if (themeCssURL) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = themeCssURL;
      document.head.appendChild(link);
    }
    if (themeJsURL) {
      const script = document.createElement("script");
      script.src = themeJsURL;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      forcedTheme={c?.enforceTheme ? c.enforceTheme : undefined}
      disableTransitionOnChange
    >
      <TooltipProvider delayDuration={100}>
        <div className="font-body">
          {isMobile ? <NotSupported /> : <Component {...pageProps} />}
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
};
