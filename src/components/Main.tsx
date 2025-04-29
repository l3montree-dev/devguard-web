// Copyright (C) 2023 Tim Bastin, l3montree UG (haftungsbeschränkt)
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
import { classNames } from "@/utils/common";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FunctionComponent, useEffect, useState } from "react";
import AppSidebar from "./AppSidebar";
import UserNav from "./navigation/UserNav";
import { SidebarProvider } from "./ui/sidebar";
import { useStore } from "@/zustand/globalStoreProvider";
import useDimensions from "@/hooks/useDimensions";
import { HEADER_HEIGHT } from "@/const/viewConstants";

interface Props {
  title: string;
  Title?: React.ReactNode;
  children: React.ReactNode;
  Button?: React.ReactNode;
  Menu?: Array<{
    title: string;
    href: string;
    Icon: FunctionComponent<{ className: string }>;
    isActive?: boolean;
  }>;
  fullscreen?: boolean;
}
const Main: FunctionComponent<Props> = ({
  title,
  Title,
  children,
  Menu,
  fullscreen,
}) => {
  const router = useRouter();
  const isSidebarOpen = useStore((s) => s.isSidebarOpen);
  const setSidebarOpen = useStore((s) => s.setSidebarOpen);
  const dimensions = useDimensions();
  useEffect(() => {
    // check local storage
    const open = localStorage.getItem("sidebarOpen");
    setSidebarOpen(open === "true");
  }, []);

  return (
    <SidebarProvider
      onOpenChange={(o) => {
        localStorage.setItem("sidebarOpen", o.toString());
        setSidebarOpen(o);
      }}
      open={isSidebarOpen}
    >
      <AppSidebar />
      <main className="flex-1 font-body">
        <header
          className={classNames(
            "relative flex min-h-[109px] items-center justify-between border-b bg-blue-950 px-4 pt-5 dark:bg-[#02040a] sm:px-6 lg:px-8",
            Boolean(Menu) ? "pb-3" : "pb-5",
          )}
        >
          <div className="absolute -left-1 bottom-0 top-0 z-10 w-2 bg-blue-950 dark:bg-[#02040a]" />
          <div className="mx-auto w-full max-w-screen-2xl">
            <div className="flex flex-row items-center gap-4">
              <Image
                src="/logo_inverse_icon.svg"
                alt="DevGuard Logo"
                width={30}
                height={30}
              />
              <div className="flex w-full flex-row items-center justify-between">
                <h1 className="font-display text-lg font-semibold leading-7 text-white">
                  {Title ?? title}
                </h1>
                <UserNav />
              </div>
            </div>
            {Menu !== undefined && (
              <div className="flex flex-row items-end gap-6 text-sm">
                {Menu.map((item) => (
                  <Link
                    className={classNames(
                      "cursor:pointer relative hover:no-underline",
                    )}
                    key={item.title}
                    href={item.href}
                  >
                    {(item.isActive || router.asPath == item.href) && (
                      <div className="absolute -bottom-3 -left-2 -right-2 h-0.5 bg-amber-400" />
                    )}
                    <div className="mt-4 flex flex-row items-center gap-1">
                      <item.Icon className="h-5 w-5 text-gray-400" />
                      <span className="text-white ">{item.title}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </header>

        <div
          style={{ minHeight: dimensions.height - HEADER_HEIGHT - 100 }}
          className={classNames(
            !fullscreen &&
              "mx-auto max-w-screen-xl gap-4 px-6 pb-8 pt-6 lg:px-8",
          )}
        >
          {children}
        </div>

        <footer className="mx-auto max-w-screen-xl px-6 pb-8 text-sm text-muted-foreground lg:px-8 absolute">
          <div className="mb-2 flex flex-row gap-5">
            <Link
              className="!text-muted-foreground"
              target="_blank"
              href="https://github.com/l3montree-dev/devguard"
            >
              GitHub
            </Link>
            <Link
              className="!text-muted-foreground"
              target="_blank"
              href="https://l3montree.com/impressum"
            >
              Imprint
            </Link>
            <Link
              className="!text-muted-foreground"
              href="https://l3montree.com/datenschutz"
            >
              Privacy
            </Link>
          </div>
          Copyright © {new Date().getFullYear()} L3montree. All rights
          reserved. Version {process.env.NEXT_PUBLIC_VERSION}
        </footer>
      </main>
    </SidebarProvider>
  );
};
export default Main;
