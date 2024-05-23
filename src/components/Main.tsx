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
import { classNames } from "@/utils/common";
import Image from "next/image";
import Link from "next/link";
import React, { FunctionComponent } from "react";

interface Props {
  title: string;
  Title?: React.ReactNode;
  children: React.ReactNode;
  Button?: React.ReactNode;
  Menu?: Array<{
    title: string;
    href: string;
    Icon: FunctionComponent<{ className: string }>;
  }>;
  fullscreen?: boolean;
}
const Main: FunctionComponent<Props> = ({
  title,
  Title,
  children,
  Button,
  Menu,
  fullscreen,
}) => {
  return (
    <main>
      <header
        className={classNames(
          "flex relative items-center justify-between dark:bg-black bg-blue-950 border-b dark:border-b-gray-700 border-b-gray-200 px-4 pt-5 sm:px-6 lg:px-8",
          Boolean(Menu) ? "pb-3" : "pb-5",
        )}
      >
        {Boolean(Button) && <div className="absolute right-4">{Button}</div>}
        <div>
          <div className="flex flex-row gap-4 items-center">
            <Image
              src="/logo_inverse_icon.svg"
              alt="Flawfix Logo"
              width={40}
              height={40}
            />
            <h1 className="text-lg font-display font-semibold leading-7 text-white">
              {Title ?? title}
            </h1>
          </div>
          {Menu !== undefined && (
            <div className="flex mt-2 flex-row gap-6 text-sm">
              {Menu.map((item) => (
                <Link
                  className="hover:no-underline cursor:pointer"
                  key={item.title}
                  href={item.href}
                >
                  <div className="flex flex-row gap-1 items-center mt-4">
                    <item.Icon className="h-5 text-gray-400 w-5" />
                    <span className="text-white ">{item.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>
      <div
        className={classNames(
          fullscreen ? "" : "px-8 py-2 sm:px-6 mt-6 lg:px-8 pb-8",
          "text-black",
        )}
      >
        {children}
      </div>
      <footer className="px-8 text-black/50 dark:text-white text-sm pb-8">
        <div className="flex flex-row gap-5 mb-2">
          <Link
            className="text-black/50 dark:text-white"
            target="_blank"
            href="https://github.com/l3montree-dev/flawfix"
          >
            GitHub
          </Link>
          <Link
            className="text-black/50 dark:text-white"
            target="_blank"
            href="https://flawfix.dev/impressum"
          >
            Imprint
          </Link>
          <Link
            className="text-black/50 dark:text-white"
            href="https://flawfix.dev/datenschutzerklaerung/"
          >
            Privacy
          </Link>
        </div>
        Copyright © 2023 L3montree. All rights reserved. Version{" "}
        {process.env.NEXT_PUBLIC_VERSION}
      </footer>
    </main>
  );
};

export default Main;
