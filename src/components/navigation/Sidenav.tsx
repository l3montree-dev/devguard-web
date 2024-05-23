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
import { UserGroupIcon } from "@heroicons/react/20/solid";
import { PlusIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useStore } from "../../zustand/globalStoreProvider";
import PopupMenu from "../common/PopupMenu";
import PopupMenuItem from "../common/PopupMenuItem";

interface Props {}

export default function Sidenav() {
  const router = useRouter();

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
    <div className="flex grow flex-row">
      <div className="flex w-16 flex-col justify-between border-r border-r-gray-200 bg-white p-2 pb-2 pt-4 dark:border-r-gray-700 dark:bg-gray-950">
        <div>
          <div className="flex flex-row justify-center">
            <PopupMenu
              Button={
                <div className="relative z-30 m-1 flex aspect-square h-9 w-9 flex-col items-center justify-center rounded-lg bg-black font-display text-2xl font-semibold text-white dark:bg-gray-700">
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
    </div>
  );
}
