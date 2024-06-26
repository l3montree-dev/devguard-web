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

import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { useActiveOrg } from "../hooks/useActiveOrg";
import { ProjectDTO } from "../types/api/api";
import ListItem from "./common/ListItem";
import PopupMenu from "./common/PopupMenu";
import PopupMenuItem from "./common/PopupMenuItem";
import { Button, buttonVariants } from "./ui/button";
import Link from "next/link";

interface Props {
  projects: Array<ProjectDTO>;
}
export default function ProjectList({ projects }: Props) {
  const { slug } = useActiveOrg();
  return (
    <>
      <div className="flex flex-col gap-2">
        {projects.map((project) => (
          <ListItem
            key={project.id}
            title={project.name}
            description={project.description}
            Button={
              <>
                {" "}
                <Link
                  className={buttonVariants({ variant: "outline" })}
                  href={"/" + slug + "/projects/" + project.slug}
                >
                  View project
                </Link>
                <PopupMenu
                  Button={
                    <Button variant="outline">
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </Button>
                  }
                >
                  <PopupMenuItem text="Edit" />
                </PopupMenu>
              </>
            }
          />
        ))}
      </div>
    </>
  );
}
