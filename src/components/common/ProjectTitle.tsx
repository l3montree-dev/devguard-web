import Link from "next/link";
import React from "react";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { Badge } from "../ui/badge";
import { ProjectDTO } from "../../types/api/api";

export const ProjectElement = ({
  project,
  activeOrg,
}: {
  project: ProjectDTO;
  activeOrg: { slug: string; name: string };
}) => {
  if (project.parent != null) {
    return (
      <>
        <ProjectElement project={project.parent} activeOrg={activeOrg} />
        <span className="opacity-75">/</span>
        <Link
          className="flex flex-row items-center gap-1 !text-white hover:no-underline"
          href={`/${activeOrg.slug}/projects/${project.slug}/assets`}
        >
          {project.name}
          <Badge
            className="font-body font-normal !text-white"
            variant="outline"
          >
            {project.parentId != null ? "Subproject" : "Project"}
          </Badge>
        </Link>
      </>
    );
  }
  return (
    <Link
      className="flex flex-row items-center gap-1 !text-white hover:no-underline"
      href={`/${activeOrg.slug}/projects/${project.slug}/assets`}
    >
      {project.name}
      <Badge className="font-body font-normal !text-white" variant="outline">
        {project.parentId != null ? "Subproject" : "Project"}
      </Badge>
    </Link>
  );
};

const ProjectTitle = () => {
  const activeOrg = useActiveOrg()!;
  const project = useActiveProject()!;

  return (
    <span className="flex flex-row gap-2">
      <Link
        href={`/${activeOrg.slug}/projects`}
        className="flex flex-row items-center gap-1 !text-white hover:no-underline"
      >
        {activeOrg.name}{" "}
        <Badge className="font-body font-normal !text-white" variant="outline">
          Organization
        </Badge>
      </Link>
      <span className="opacity-75">/</span>
      <ProjectElement project={project} activeOrg={activeOrg} />
    </span>
  );
};

export default ProjectTitle;
