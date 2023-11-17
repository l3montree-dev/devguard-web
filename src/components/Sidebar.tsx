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

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function Sidebar({ title, children }: Props) {
  return (
    <>
      <header className="flex items-center justify-between bg-blue-950 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <h2 className="text-base font-semibold leading-7 text-white">
          {title}
        </h2>
      </header>
      {children}
    </>
  );
}
