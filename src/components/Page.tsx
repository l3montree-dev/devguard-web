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

import { Dialog, Transition } from "@headlessui/react";
import {
  ChartBarSquareIcon,
  Cog6ToothIcon,
  GlobeAltIcon,
  ServerIcon,
  SignalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Fragment, PropsWithChildren, useState } from "react";
import MobileSidebar from "./Navigation/MobileSidebar";
import Sidebar from "./Navigation/Sidebar";
import { classNames } from "../utils/common";
import Link from "next/link";

type PageProps = {
  title: string;
  // searchActive: boolean;
  Sidebar?: React.ReactNode;
};

const navigation = [
  { name: "Projects", href: "/projects", icon: ServerIcon },
  { name: "Latest Activity", href: "/activity", icon: SignalIcon },
  { name: "Domains", href: "/domains", icon: GlobeAltIcon },
  { name: "Reports", href: "/reports", icon: ChartBarSquareIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];
// Add that the navigation is a prop
const Page = (props: PropsWithChildren<PageProps>) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 xl:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                <MobileSidebar navigation={navigation} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col bg-black/20">
        <Sidebar navigation={navigation} />
      </div>

      <div className="xl:pl-72">
        {/*<StickySearchHeader
          setSidebarOpen={setSidebarOpen}
          isActive={props.searchActive}
        /> */}

        <main
          className={classNames(
            "bg-slate-950",
            props.Sidebar ? "lg:mr-96" : "lg:mr-0",
          )}
        >
          <header className="flex bg-black/20 items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            <h1 className="text-lg font-semibold leading-7 text-white">
              {props.title}
            </h1>
          </header>
          <div className="px-8 py-2 sm:px-6 mt-6 lg:px-8 pb-8">
            {props.children}
          </div>
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
        {!!props.Sidebar && (
          <aside className="flex-1 bg-slate-950/50 lg:fixed lg:bottom-0 lg:right-0 top-0 lg:w-96 lg:overflow-y-auto lg:border-l lg:border-white/5">
            {props.Sidebar}
          </aside>
        )}
      </div>
    </>
  );
};

export default Page;
