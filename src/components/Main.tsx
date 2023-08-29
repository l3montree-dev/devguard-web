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
import Link from "next/link";
import React, { FunctionComponent } from "react";
import { classNames } from "../utils/common";

interface Props {
  title: string;
  children: React.ReactNode;
}
const Main: FunctionComponent<Props> = ({ title, children }) => {
  return (
    <main>
      <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <h1 className="text-lg font-semibold leading-7 text-white">{title}</h1>
      </header>
      <div className="px-8 py-2 sm:px-6 mt-6 lg:px-8 pb-8">{children}</div>
      <footer className="px-8 text-slate-500 text-sm pb-8">
        <div className="flex flex-row gap-5 mb-2">
          <Link
            className="text-slate-500"
            target="_blank"
            href="https://github.com/l3montree-dev/flawfix"
          >
            GitHub
          </Link>
          <Link
            className="text-slate-500"
            target="_blank"
            href="https://flawfix.dev/impressum"
          >
            Imprint
          </Link>
          <Link
            className="text-slate-500"
            href="https://flawfix.dev/datenschutzerklaerung/"
          >
            Privacy
          </Link>
        </div>
        Copyright © 2023 l3montree. All rights reserved.
      </footer>
    </main>
  );
};

export default Main;
