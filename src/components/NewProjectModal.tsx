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

import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Environment, Project } from "@/types/common";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  setProject: (project: Project) => void;
}

export default function NewProjectModal({
  open = false,
  setOpen,
  setProject,
}: Props) {
  const cancelButtonRef = useRef(null);

  const envs = [
    { id: "prod", title: "Production (default)" },
    { id: "stage", title: "Staging" },
    { id: "dev", title: "Development" },
  ];

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const project: Project = {
      name: event.target.projectName.value as string,
      environment: event.target.environment.value as Environment,
      status: "All handeled",
      lastReport: null,
      lastReportDateTime: null,
    };
    if (project.name === "" || project.environment === null) {
      return;
    }
    setProject(project);
    setOpen(false);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-base font-semibold leading-6 text-white"
                  >
                    Create a new Project
                  </Dialog.Title>
                  <form className="mt-8" onSubmit={handleSubmit}>
                    <div className="space-y-12">
                      <div className="grid gap-x-6 grid-cols-1 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                          <label
                            htmlFor="projectName"
                            className="block text-sm font-medium leading-6 text-white"
                          >
                            Project name *
                          </label>
                          <div className="mt-2">
                            <div className="flex rounded-md bg-white/10 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500">
                              <input
                                required
                                type="text"
                                name="projectName"
                                id="projectName"
                                className="flex-1 border-0 bg-transparent py-1.5 pl-2.5 text-white focus:ring-0 sm:text-sm sm:leading-6"
                                placeholder="My first project"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <label
                        htmlFor="environment"
                        className="block text-sm font-medium leading-6 text-white"
                      >
                        Environment *
                      </label>
                      <p className="text-sm text-blue-200">
                        Set the current environment for this project.
                      </p>
                      <fieldset className="mt-4">
                        <legend className="sr-only">Notification method</legend>
                        <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                          {envs.map((env) => (
                            <div key={env.id} className="flex items-center">
                              <input
                                id={env.id}
                                name="environment"
                                type="radio"
                                defaultChecked={env.id === "prod"}
                                value={env.id}
                                className="h-4 w-4 bg-gray-400 border-gray-200 text-blue-600 focus:ring-blue-600"
                              />
                              <label
                                htmlFor={env.id}
                                className="ml-3 block text-sm font-medium leading-6 text-white"
                              >
                                {env.title}
                              </label>
                            </div>
                          ))}
                        </div>
                      </fieldset>
                    </div>

                    <div className="mt-4  px-4 py-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                      >
                        Create Project
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={() => setOpen(false)}
                        ref={cancelButtonRef}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
