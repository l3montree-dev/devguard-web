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

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { classNames } from "@/utils/common";

const statuses: { [key: string]: string } = {
  "All handeled": "text-green-900 bg-green-300 ring-green-800/20",
  "Unhandeled Flaws": "text-red-950 bg-red-300 ring-red-800/10",
  Archived: "text-yellow-900 bg-yellow-200 ring-yellow-600/20",
};

const projects = [
  {
    id: 1,
    name: "GraphQL API",
    href: "#",
    status: "All handeled",
    environments: "Prod, Stage, Dev",
    dueDate: "July 17, 2023",
    dueDateTime: "2023-07-17T00:00Z",
  },
  {
    id: 2,
    name: "REST API",
    href: "#",
    status: "Unhandeled Flaws",
    environments: "Prod",
    dueDate: "June 7, 2023",
    dueDateTime: "2023-05-05T00:00Z",
  },
  {
    id: 3,
    name: "Custom Mail Server",
    href: "#",
    status: "Unhandeled Flaws",
    environments: "Prod",
    dueDate: "May 25, 2023",
    dueDateTime: "2023-05-25T00:00Z",
  },
  {
    id: 4,
    name: "iOS app",
    href: "#",
    status: "Unhandeled Flaws",
    environments: "Prod, Stage, Dev",
    dueDate: "June 7, 2023",
    dueDateTime: "2023-06-07T00:00Z",
  },
  {
    id: 5,
    name: "Android App",
    href: "#",
    status: "Archived",
    environments: "Prod, Stage, Dev",
    dueDate: "June 10, 2023",
    dueDateTime: "2023-06-10T00:00Z",
  },
];

export default function ProjectList() {
  return (
    <>
      <ul role="list" className="divide-y divide-gray-800">
        {projects.map((project) => (
          <li
            key={project.id}
            className="flex items-center justify-between gap-x-6 py-5"
          >
            <div className="min-w-0">
              <div className="flex items-start gap-x-3">
                <p className="font-semibold leading-6 text-white">
                  {project.name}
                </p>
                <p
                  className={classNames(
                    statuses[project.status],
                    "rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                  )}
                >
                  {project.status}
                </p>
              </div>
              <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-400">
                <p className="whitespace-nowrap">
                  Latest Report:{" "}
                  <time dateTime={project.dueDateTime}>{project.dueDate}</time>
                </p>
                <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                  <circle cx={1} cy={1} r={1} />
                </svg>
                <p className="truncate">
                  Managed Environments: {project.environments}
                </p>
              </div>
            </div>
            <div className="flex flex-none items-center gap-x-4">
              <a
                href={project.href}
                className="text-sm font-semibold leading-6 text-blue-500 hover:text-blue-400"
              >
                View project<span className="sr-only">, {project.name}</span>
              </a>
              <Menu as="div" className="relative flex-none">
                <Menu.Button className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
                  <span className="sr-only">Open options</span>
                  <EllipsisVerticalIcon
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-gray-800 py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active ? "bg-gray-700" : "",
                            "block px-3 py-1 text-sm leading-6 text-white",
                          )}
                        >
                          Edit<span className="sr-only">, {project.name}</span>
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active ? "bg-gray-700" : "",
                            "block px-3 py-1 text-sm leading-6 text-white",
                          )}
                        >
                          Archive
                          <span className="sr-only">, {project.name}</span>
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active ? "bg-gray-700" : "",
                            "block px-3 py-1 text-sm leading-6 text-red-500",
                          )}
                        >
                          Delete
                          <span className="sr-only">, {project.name}</span>
                        </a>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
