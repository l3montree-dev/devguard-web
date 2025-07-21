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

import "@/styles/tailwind.scss";
import "focus-visible";
import { ThemeProvider } from "next-themes";
import { Inter, Lexend, Merriweather } from "next/font/google";
import { StoreProvider } from "../zustand/globalStoreProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import SetupOrg from "./notsupported";
import NotSupported from "./notsupported";

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
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    window.innerWidth < 768 && setIsMobile(true);
  }, []);

  console.log(pageProps);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider delayDuration={100}>
        <StoreProvider initialZustand={pageProps.initialZustand}>
          <div className="font-body">
            {isMobile ? (
              <NotSupported>NOT SUPPORTED</NotSupported>
            ) : (
              <Component {...pageProps} />
            )}
          </div>
        </StoreProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
