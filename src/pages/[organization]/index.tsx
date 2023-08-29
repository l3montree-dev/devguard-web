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
import StickySearchHeader from "../../components/navigation/StickySearchHeader";
import Image from "next/image";
import MobileSidebar from "../../components/navigation/MobileSidebar";
import Sidebar from "../../components/navigation/Sidebar";
import { ActivityItem, ActivityItems } from "@/types/common";
import { calculateActivityString } from "@/utils/activityFeed";
import SingleStatGroup from "../../components/SingleStatGroup";
import ProjectList from "../../components/ProjectList";
import Page from "../../components/Page";
import { withSession } from "../../decorators/withSession";
import { withOrganization } from "../../decorators/withOrganization";

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

export default function Projects() {
  return (
    <Page
      Sidebar={
        <div>
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
        </div>
      }
      title="Projects"
    >
      <div>
        <SingleStatGroup />
      </div>
      <div>
        <ProjectList />
      </div>
    </Page>
  );
}

export const getServerSideProps = withSession(
  withOrganization((session, organization, ctx) => {
    return {
      props: {},
    };
  }),
);
