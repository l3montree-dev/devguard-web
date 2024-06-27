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

import { useOrg } from "@/hooks/useOrg";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { PlusIcon, UserIcon } from "@heroicons/react/24/solid";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/router";
import { useStore } from "../../zustand/globalStoreProvider";
import { Button, buttonVariants } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface Props {}

export default function Sidenav() {
  const router = useRouter();

  const { setTheme } = useTheme();

  const user = useStore((s) => s.session?.identity);
  const orgs = useStore((s) => s.organizations);

  const activeOrg = useOrg() ?? orgs[0];

  const handleActiveOrgChange = (id: string) => () => {
    // redirect to the new slug
    const org = orgs.find((o) => o.id === id);
    if (org) {
      router.push(`/${org.slug}`);
    }
  };

  const handleNavigateToSetupOrg = () => {
    router.push(`/setup-organization`);
  };

  return (
    <div className="flex grow flex-row bg-card">
      <div className="flex w-16 flex-col justify-between border-r p-2 pb-2 pt-4 ">
        <div>
          <div className="flex flex-row justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={"outline"}
                  size={"icon"}
                  className="text-2xl font-semibold"
                >
                  {activeOrg?.name[0] ?? <PlusIcon className="h-6 w-6" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {orgs.length !== 0 && (
                  <>
                    {orgs.map((o) => (
                      <DropdownMenuItem
                        key={o.id}
                        onClick={handleActiveOrgChange(o.id)}
                      >
                        {o.name}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                <DropdownMenuItem onClick={handleNavigateToSetupOrg}>
                  Join Organization
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleNavigateToSetupOrg}>
                  Create Organization
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex flex-row justify-center">
                <Button variant="outline" size="icon">
                  <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex flex-row justify-center">
            {user && (
              <Link
                className={buttonVariants({ variant: "outline", size: "icon" })}
                href="/user-settings"
              >
                <UserIcon
                  className="text-card-foreground"
                  width={25}
                  height={25}
                />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
