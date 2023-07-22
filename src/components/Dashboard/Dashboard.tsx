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

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ChartBarSquareIcon,
  Cog6ToothIcon,
  GlobeAltIcon,
  ServerIcon,
  SignalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import StickySearchHeader from "../Navigation/StickySearchHeader";
import Image from "next/image";
import MobileSidebar from "../Navigation/MobileSidebar";
import Sidebar from "../Navigation/Sidebar";
import { ActivityItem, ActivityItems } from "@/types/common";
import { calculateActivityString } from "@/utils/activityFeed";
import SingleStatGroup from "../SingleStatGroup";

const navigation = [
  { name: "Projects", href: "#", icon: ServerIcon, current: true },
  { name: "Latest Activity", href: "#", icon: SignalIcon, current: false },
  { name: "Domains", href: "#", icon: GlobeAltIcon, current: false },
  { name: "Reports", href: "#", icon: ChartBarSquareIcon, current: false },
  { name: "Settings", href: "#", icon: Cog6ToothIcon, current: false },
];
const statuses = {
  offline: "text-gray-500 bg-gray-100/10",
  online: "text-green-400 bg-green-400/10",
  error: "text-rose-400 bg-rose-400/10",
};
const environments = {
  Preview: "text-gray-400 bg-gray-400/10 ring-gray-400/20",
  Behandeln: "text-rose-400 bg-rose-400/10 ring-rose-400/30",
};
const projects = [
  {
    id: 1,
    href: "#",
    projectName: "3 nicht verwaltete Schwachstellen",
    teamName: "StampLab",
    status: "error",
    statusText: "Offen seit 1 Tag 4 Stunden",
    description: "l3montree (Self Managed)",
    environment: "Behandeln",
  },
];
const activityItems: ActivityItems = {
  items: [
    {
      id: 1,
      user: {
        name: "Tim Bastin",
        imageUrl: "/examples/tim.jpg",
      },
      projectName: "StampLab",
      cve: "CVE-2023-1234",
      newState: "verifiedFix",
      date: "1h",
      dateTime: "2023-01-23T11:00",
    },
    {
      id: 2,
      user: {
        name: "Sebastian Kawelke",
        imageUrl: "/examples/sebastian.jpg",
      },
      projectName: "StampLab",
      cve: "CVE-2023-1234",
      newState: "pendingFix",
      date: "1h",
      dateTime: "2023-01-23T11:00",
    },
    {
      id: 3,
      user: {
        name: "Frédéric Noppe",
        imageUrl: "/examples/frederic.jpg",
      },
      projectName: "StampLab",
      cve: "CVE-2023-1234",
      newState: "pendingFix",
      date: "1h",
      dateTime: "2023-01-23T11:00",
    },
    {
      id: 4,
      user: {
        name: "Tim Bastin",
        imageUrl: "/examples/tim.jpg",
      },
      projectName: "StampLab",
      cve: "CVE-2023-1234",
      newState: "verifiedFix",
      date: "1h",
      dateTime: "2023-01-23T11:00",
    },
  ],
};

export default function Example() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <div>
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
        <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
          <Sidebar navigation={navigation} />
        </div>

        <div className="xl:pl-72">
          <StickySearchHeader setSidebarOpen={setSidebarOpen} />

          <main className="lg:pr-96">
            <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
              <h1 className="text-lg font-semibold leading-7 text-white">
                Projects
              </h1>
            </header>
            <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
              <SingleStatGroup />
            </div>
          </main>

          {/* Activity feed */}
          <aside className="bg-black/10 lg:fixed lg:bottom-0 lg:right-0 lg:top-16 lg:w-96 lg:overflow-y-auto lg:border-l lg:border-white/5">
            <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
              <h2 className="text-base font-semibold leading-7 text-white">
                Activity feed
              </h2>
              <a
                href="#"
                className="text-sm font-semibold leading-6 text-blue-500 hover:text-blue-400"
              >
                View all
              </a>
            </header>
            <ul role="list" className="divide-y divide-white/5">
              {activityItems.items.map((item: ActivityItem) => (
                <li key={item.id} className="px-4 py-4 sm:px-6 lg:px-8">
                  <div className="flex items-center gap-x-3">
                    <Image
                      src={item.user.imageUrl}
                      alt=""
                      width={32}
                      height={32}
                      className="h-6 w-6 flex-none rounded-full bg-gray-800"
                    />
                    <h3 className="flex-auto truncate text-sm font-semibold leading-6 text-gray-400">
                      {item.user.name}
                    </h3>
                    <time
                      dateTime={item.dateTime}
                      className="flex-none text-xs text-gray-600"
                    >
                      {item.date}
                    </time>
                  </div>
                  <div className="mt-3">{calculateActivityString(item)}</div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </>
  );
}
