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
import React, { Fragment, PropsWithChildren, useState } from "react";
import { classNames } from "../utils/common";
import Main from "./Main";
import Sidenav from "./navigation/Sidenav";
import { Toaster } from "./ui/sonner";

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
