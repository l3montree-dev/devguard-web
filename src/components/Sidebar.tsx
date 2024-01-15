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

interface Props {
  title: JSX.Element;
  children: React.ReactNode;
}

export default function Sidebar({ title, children }: Props) {
  return (
    <>
      <header className="flex w-full items-center justify-between bg-white border-r-gray-200 border-r px-6 py-5">
        <h2 className="text-base w-full font-semibold leading-7 text-black">
          {title}
        </h2>
      </header>
      {children}
    </>
  );
}
