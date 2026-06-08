// Copyright (C) 2023 Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
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
"use client";

import { classNames } from "@/utils/common";

import { getLogoutUrl } from "@/server/actions/logout";
import {
  CogIcon,
  MoonIcon,
  SunIcon,
  WrenchScrewdriverIcon,
  CircleStackIcon,
  DocumentMagnifyingGlassIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button, buttonVariants } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useConfig } from "../../context/ConfigContext";
import { getUserFullName } from "../../types/auth";
import HelpDropdown from "./HelpDropdown";
import StarRepo from "./StarRepo";

export default function UserNav() {
  const { setTheme } = useTheme();

  const user = useCurrentUser();

  const config = useConfig();

  const handleLogout = async () => {
    const logoutUrl = await getLogoutUrl();
    window.location.href = logoutUrl;
  };

  return (
    <div className="flex items-center text-header-foreground user-nav flex-row justify-between gap-1">
      <StarRepo />
      <HelpDropdown />
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Open tools menu">
          <div className="flex w-10 flex-row justify-center">
            <WrenchScrewdriverIcon className="h-[1.2rem] w-[1.2rem] text-header-foreground transition-all cursor-pointer" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <Link
            className="hover:bg-transparent hover:no-underline !text-foreground"
            href={`https://docs.devguard.org/package-inspector?src=${config.frontendUrl}&app=devguard-web`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <DropdownMenuItem className="hover:bg-transparent cursor-pointer hover:no-underline !text-foreground flex items-center gap-2">
              <DocumentMagnifyingGlassIcon className="h-4 w-4" />
              <span>Package Inspector</span>
            </DropdownMenuItem>
          </Link>

          <DropdownMenuSeparator />
          <Link
            className="hover:bg-transparent hover:no-underline !text-foreground"
            href={`https://docs.devguard.org/vulnerability-database/?src=${config.frontendUrl}&app=devguard-web`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <DropdownMenuItem className="hover:bg-transparent cursor-pointer hover:no-underline !text-foreground flex items-center gap-2">
              <CircleStackIcon className="h-4 w-4" />
              <span>Vulnerability Database</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
      {!config.enforceTheme && (
        <DropdownMenu>
          <DropdownMenuTrigger className="theme-chooser">
            <div className="flex w-10 flex-row justify-center">
              <SunIcon className="h-[1.2rem] cursor-pointer w-[1.2rem] rotate-0 scale-100 text-background transition-all dark:-rotate-90 dark:scale-0 text-header-foreground" />
              <MoonIcon className="absolute cursor-pointer h-[1.2rem] w-[1.2rem] rotate-90 scale-0 text-background transition-all dark:rotate-0 dark:scale-100 text-header-foreground" />
              <span className="sr-only">Toggle theme</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setTheme("light")}
            >
              Light
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setTheme("dark")}
            >
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setTheme("system")}
            >
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Link
              id="user-nav-user"
              className={classNames(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "hover:bg-transparent hover:no-underline",
              )}
              href="/user-settings"
            >
              <Avatar>
                {/*<AvatarImage src="https://github.com/shadcn.png" />*/}
                <AvatarFallback>
                  {getUserFullName(user)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link className="hover:no-underline" href={"/user-settings"}>
              <DropdownMenuItem
                id="user-nav-settings-button"
                className="text-foreground hover:no-underline"
              >
                <CogIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                User Settings
              </DropdownMenuItem>
            </Link>
            <button onClick={handleLogout} className="w-full">
              <DropdownMenuItem
                id="user-nav-logout-button"
                className="text-foreground hover:no-underline"
              >
                <ArrowRightStartOnRectangleIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                Logout
              </DropdownMenuItem>
            </button>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link href="/login">
          <Button variant="default">Login</Button>
        </Link>
      )}
    </div>
  );
}
