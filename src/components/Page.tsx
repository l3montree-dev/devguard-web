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
import { XMarkIcon } from "@heroicons/react/24/outline";
import Head from "next/head";
import React, {
  Fragment,
  FunctionComponent,
  PropsWithChildren,
  useState,
} from "react";
import { classNames } from "../utils/common";
import Main from "./Main";
import Toaster from "./Toaster";
import MobileNav from "./navigation/MobileNav";
import Sidenav from "./navigation/Sidenav";

type PageProps = {
  title: string;
  Title?: React.ReactNode;
  // searchActive: boolean;
  Sidebar?: React.ReactNode;
  Button?: React.ReactNode;
  Menu?: Array<{
    title: string;
    href: string;
    Icon: any;
  }>;
  fullscreen?: boolean;
};

// Add that the navigation is a prop
const Page = (props: PropsWithChildren<PageProps>) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Head>
        <title>{props.title}</title>
      </Head>

      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10 xl:hidden"
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
                {/*   <MobileNav navigation={menu} /> */}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      {/* Static sidebar for desktop */}
      <div className="inset-y-0 z-10 hidden flex-col md:fixed md:flex">
        <Sidenav />
      </div>
      <div className="md:pl-16">
        <div className={classNames(props.Sidebar ? "lg:pr-72" : "")}>
          <Main
            fullscreen={props.fullscreen}
            Menu={props.Menu}
            Button={props.Button}
            Title={props.Title}
            title={props.title}
          >
            {props.children}
          </Main>
        </div>
        {!!props.Sidebar && (
          <aside className="bottom-0 right-0 top-0 hidden w-72 flex-1 overflow-y-auto border-l bg-card dark:text-white md:fixed lg:block">
            {props.Sidebar}
          </aside>
        )}
      </div>
      <Toaster />
    </>
  );
};

export default Page;
