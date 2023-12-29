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

import Image from "next/image";
import { classNames } from "../../utils/common";
import { useRouter } from "next/router";
import Link from "next/link";
import { useStore } from "../../zustand/globalStoreProvider";
import PopupMenu from "../common/PopupMenu";
import { PlusIcon } from "@heroicons/react/24/outline";
import PopupMenuItem from "../common/PopupMenuItem";
import { UserGroupIcon } from "@heroicons/react/20/solid";
import { useActiveOrg } from "../../hooks/useActiveOrg";

interface Props {
  navigation: {
    name: string;
    href: string;
    icon: any;
  }[];
}

export default function Sidenav({ navigation }: Props) {
  const router = useRouter();
  const currentPath = router.asPath;

  const user = useStore((s) => s.session?.identity);
  const orgs = useStore((s) => s.organizations);

  const activeOrg = useActiveOrg() ?? orgs[0];

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
    <div className="flex grow flex-row">
      <div className="border-r border-r-gray-200 flex pt-4 pb-2 flex-col justify-between w-16 p-2">
        <div>
          <div className="flex flex-row justify-center">
            <PopupMenu
              Button={
                <div className="bg-black h-9 w-9 relative z-30 rounded-lg font-semibold flex flex-col justify-center items-center text-white text-2xl aspect-square m-1">
                  {activeOrg?.name[0] ?? <PlusIcon className="h-6 w-6" />}
                </div>
              }
            >
              <div className="text-black">
                {orgs.length !== 0 && (
                  <>
                    {orgs.map((o) => (
                      <PopupMenuItem
                        text={o.name}
                        Icon={o.name[0]}
                        key={o.id}
                        onClick={handleActiveOrgChange(o.id)}
                      />
                    ))}
                  </>
                )}
                <PopupMenuItem
                  text="Join Organization"
                  onClick={handleNavigateToSetupOrg}
                  Icon={<UserGroupIcon className="h-6 w-6" />}
                />
                <PopupMenuItem
                  text="Create Organization"
                  onClick={handleNavigateToSetupOrg}
                  Icon={<PlusIcon className="h-6 w-6" />}
                />
              </div>
            </PopupMenu>
          </div>
        </div>
        <div className="flex flex-row justify-center">
          {user && (
            <Link href="/user-settings">
              <Image
                className="rounded-lg bg-gray-800"
                src="/examples/tim.jpg"
                alt=""
                width={40}
                height={40}
              />
            </Link>
          )}
        </div>
      </div>
      <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6">
        <div className="flex h-24 shrink-0 items-center">
          <Image
            className="mt-6 h-10 w-auto"
            src="/logo_flaw_fix_black_l3.svg"
            alt="FlawFix by l3montree Logo"
            width={32}
            height={32}
          />
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={classNames(
                        currentPath.startsWith(item.href)
                          ? "bg-gray-200 text-black"
                          : "text-black hover:bg-gray-200",
                        "group flex gap-x-3 rounded-md p-2 text-sm font-semibold transition-all leading-6 hover:no-underline",
                      )}
                    >
                      <item.icon
                        className="h-6 w-6 shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
