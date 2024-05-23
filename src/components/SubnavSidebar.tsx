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

import Link from "next/link";
import Sidebar from "./Sidebar";

interface Props {
  links: Array<{
    title: string;
    href: string;
  }>;
}

export default function SubnavSidebar({ links }: Props) {
  return (
    <Sidebar title="Navigation">
      <ol role="list" className="flex flex-col gap-4 py-4 px-4">
        {links.map((link) => (
          <Link className="hover:no-underline" key={link.href} href={link.href}>
            <li className="text-sm transition-all px-2 rounded-md py-2 hover:no-underline dark:hover:bg-gray-800 hover:bg-gray-200 dark:text-white text-black">
              {link.title}
            </li>
          </Link>
        ))}
      </ol>
    </Sidebar>
  );
}
