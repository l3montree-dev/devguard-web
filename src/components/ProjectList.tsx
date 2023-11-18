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
import Button from "./common/Button";
import PopupMenu from "./common/PopupMenu";
import PopupMenuItem from "./common/PopupMenuItem";
import { ProjectDTO } from "../types/api";
import { useActiveOrg } from "../hooks/useActiveOrg";

const statuses: { [key: string]: string } = {
  "All handeled": "text-green-900 bg-green-300 ring-green-800/20",
  "Unhandeled Flaws": "text-red-950 bg-red-300 ring-red-800/10",
  Archived: "text-yellow-900 bg-yellow-200 ring-yellow-600/20",
};

interface Props {
  projects: Array<ProjectDTO>;
}
export default function ProjectList({ projects }: Props) {
  const { slug } = useActiveOrg()!;
  return (
    <>
      <div className="flex flex-col gap-2">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex bg-white rounded-sm px-5 items-center justify-between gap-x-6 py-5"
          >
            <div className="min-w-0">
              <div className="flex items-start gap-x-3">
                <p className="font-semibold leading-6">{project.name}</p>
              </div>
            </div>
            <div className="flex flex-none items-center gap-x-4">
              <Button
                variant="outline"
                intent="secondary"
                href={"/" + slug + "/projects/" + project.slug}
              >
                View project
              </Button>
              <PopupMenu
                Button={
                  <Button variant="outline" intent="secondary">
                    <EllipsisVerticalIcon className="w-5 h-5 text-blue-600" />
                  </Button>
                }
              >
                <PopupMenuItem text="Edit" />
              </PopupMenu>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
