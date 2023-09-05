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
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Fragment, PropsWithChildren, useState } from "react";
import { classNames } from "../utils/common";
import Main from "./Main";
import Toaster from "./Toaster";
import MobileSidebar from "./navigation/MobileSidebar";
import Sidebar from "./navigation/Sidebar";

type PageProps = {
  title: string;
  // searchActive: boolean;
  Sidebar?: React.ReactNode;
  Button?: React.ReactNode;
  navigation: Array<{
    name: string;
    href: string;
    icon: any;
  }>;
};

// Add that the navigation is a prop
const Page = (props: PropsWithChildren<PageProps>) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <Toaster />
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
                <MobileSidebar navigation={props.navigation} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      {/* Static sidebar for desktop */}
      <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col bg-black/20">
        <Sidebar navigation={props.navigation} />
      </div>
      <div className="xl:pl-72">
        {/*<StickySearchHeader
          setSidebarOpen={setSidebarOpen}
          isActive={props.searchActive}
        /> */}

        <div className={classNames(props.Sidebar ? "lg:pr-96" : "lg:pr-72")}>
          <Main Button={props.Button} title={props.title}>
            {props.children}
          </Main>
        </div>
        {!!props.Sidebar && (
          <aside className="flex-1 bg-black/20 lg:fixed lg:bottom-0 lg:right-0 top-0 lg:w-96 lg:overflow-y-auto lg:border-l lg:border-white/5">
            {props.Sidebar}
          </aside>
        )}
      </div>
    </>
  );
};

export default Page;
