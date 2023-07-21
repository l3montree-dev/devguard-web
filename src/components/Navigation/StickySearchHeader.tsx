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

import { Bars3Icon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";

interface Props {
  setSidebarOpen: (open: boolean) => void;
}

export default function StickySearchHeader({ setSidebarOpen }: Props) {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-white/5 bg-gray-900 px-4 shadow-sm sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-white xl:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Suche
          </label>
          <div className="relative w-full">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-500"
              aria-hidden="true"
            />
            <input
              id="search-field"
              className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-white focus:ring-0 sm:text-sm"
              placeholder="Search..."
              type="search"
              name="search"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
