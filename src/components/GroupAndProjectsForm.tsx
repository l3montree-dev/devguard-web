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

import { PlusIcon } from "@heroicons/react/20/solid";
import NewProjectModal from "./NewProjectModal";
import { useState } from "react";
import { GroupAndProjects, Project } from "@/types/common";
import DynamicProjectList from "./DynamicProjectList";

export default function GroupAndProjectsForm() {
  const [showModal, setShowModal] = useState(false);

  const [groupAndProjects, setGroupOrProject] = useState<GroupAndProjects>({
    name: "Default-Group",
    projects: [],
  });

  const handleChangeValue = (event: { target: { value: any } }) => {
    setGroupOrProject({ ...groupAndProjects, name: event.target.value });
  };

  const setProject = (project: Project) => {
    setGroupOrProject({
      ...groupAndProjects,
      projects: [...groupAndProjects.projects, project],
    });
  };

  const removeProject = (projectName: string) => {
    setGroupOrProject({
      ...groupAndProjects,
      projects: groupAndProjects.projects.filter(
        (project) => project.name !== projectName,
      ),
    });
  };

  return (
    <>
      <form>
        <div className="space-y-8">
          <div className="border-b border-white/10 pb-8">
            <h2 className="text-base font-semibold leading-7 text-white">
              Create your first Group
            </h2>
            <p className="mt-1 text-sm leading-6 text-blue-100">
              Organize you projects in groups, just like folders. Groups can
              also serve as a namespace for several projects.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="group-name"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Group Name *
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500">
                    <input
                      required
                      type="text"
                      name="group-name"
                      id="group-name"
                      onChange={handleChangeValue}
                      defaultValue={"Default-Group"}
                      className="flex-1 border-0 bg-transparent py-1.5 pl-2.5 text-white focus:ring-0 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {groupAndProjects.projects.length > 0 ? (
            <div>
              <DynamicProjectList
                groupAndProjects={groupAndProjects}
                removeProject={removeProject}
                setShowModal={setShowModal}
              />
            </div>
          ) : (
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-blue-100"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-white">
                No projects
              </h3>
              <p className="mt-1 text-sm text-blue-100">
                Get started by creating a new project.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <PlusIcon
                    className="-ml-0.5 mr-1.5 h-5 w-5"
                    aria-hidden="true"
                  />
                  Add Project
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="submit"
            className="rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            Continue
          </button>
        </div>
      </form>
      <NewProjectModal
        open={showModal}
        setOpen={setShowModal}
        setProject={setProject}
      />
    </>
  );
}
