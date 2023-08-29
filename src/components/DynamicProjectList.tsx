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
import { EllipsisVerticalIcon, PlusIcon } from "@heroicons/react/20/solid";
import { classNames } from "@/utils/common";
import { GroupAndProjects } from "@/types/common";

const statuses: { [key: string]: string } = {
  "All handeled": "text-green-900 bg-green-300 ring-green-800/20",
  "Unhandeled Flaws": "text-red-950 bg-red-300 ring-red-800/10",
  Archived: "text-yellow-900 bg-yellow-200 ring-yellow-600/20",
};

interface Props {
  groupAndProjects: GroupAndProjects;
  removeProject: (event: any) => void;
  setShowModal: (showModal: boolean) => void;
}

export default function DynamicProjectList({
  groupAndProjects,
  removeProject,
  setShowModal,
}: Props) {
  const handleRemoveProject = (event: any) => {
    event.preventDefault();
    removeProject(event.target.value);
  };
  return (
    <>
      <ul role="list" className="-mt-4 divide-y divide-gray-800 space-y-4">
        {groupAndProjects.projects.map((project) => (
          <li
            key={project.name}
            className="flex items-center justify-between gap-x-6"
          >
            <div className="min-w-0 pt-4">
              <div className="flex items-start gap-x-3">
                <p className="leading-6">
                  <span className="text-blue-200">
                    {groupAndProjects.name} /
                  </span>{" "}
                  <span className="font-semibold text-white">
                    {project.name}
                  </span>
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
              <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-blue-200">
                <p className="whitespace-nowrap">
                  Latest Report:{" "}
                  <time dateTime={project.lastReportDateTime || undefined}>
                    {project.lastReport}
                  </time>
                </p>
                <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                  <circle cx={1} cy={1} r={1} />
                </svg>
                <p className="truncate">
                  Managed Environments: {project.environment}
                </p>
              </div>
            </div>
            <div className="flex flex-none items-center gap-x-4">
              <Menu as="div" className="relative flex-none">
                <Menu.Button className="-m-2.5 block p-2.5 text-blue-200 hover:text-blue-200">
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
                        <button
                          role="button"
                          value={project.name}
                          onClick={handleRemoveProject}
                          className={classNames(
                            active ? "bg-gray-700" : "",
                            "block px-3 py-1 text-sm leading-6 text-red-500 w-full text-left",
                          )}
                        >
                          Delete
                          <span className="sr-only">, {project.name}</span>
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </li>
        ))}
      </ul>
      <div className="text-center">
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Add another Project
          </button>
        </div>
      </div>
    </>
  );
}
