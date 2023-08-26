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

interface Props {
  navigation: {
    name: string;
    href: string;
    icon: any;
  }[];
}

export default function Sidebar({ navigation }: Props) {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 ring-1 ring-white/5">
      <div className="flex h-24 shrink-0 items-center">
        <Image
          className="mt-6 h-10 w-auto"
          src="logo_flaw_fix_white_l3.svg"
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
                      item.href === currentPath
                        ? "bg-slate-800 text-white"
                        : "text-gray-400 hover:bg-slate-800 hover:text-white",
                      "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 hover:no-underline",
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
          <li className="-mx-6 mt-auto">
            <a
              href="#"
              className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-gray-800"
            >
              <Image
                className="h-10 w-10 rounded-full bg-gray-800"
                src="/examples/tim.jpg"
                alt=""
                width={32}
                height={32}
              />
              <span className="sr-only">Your profile</span>
              <span aria-hidden="true">Tim Bastin</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
