import Link from "next/link";
import React from "react";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { Badge } from "../ui/badge";
import { ProjectDTO } from "../../types/api/api";
import Image from "next/image";

// Utility function to truncate text in the middle with ellipsis
const truncateMiddle = (text: string, maxLength: number = 20): string => {
  if (text.length <= maxLength) return text;

  const start = Math.ceil((maxLength - 3) / 2);
  const end = Math.floor((maxLength - 3) / 2);

  return text.slice(0, start) + "..." + text.slice(-end);
};

export const ProjectBadge = ({ type }: { type: ProjectDTO["type"] }) => {
  if (type === "kubernetesNamespace") {
    return (
      <Badge className=" !text-white" variant="outline">
        <Image
          src="/assets/kubernetes.svg"
          width={16}
          height={16}
          className="-ml-1.5 mr-1"
          alt="Kubernetes"
        />
        Kubernetes Namespace
      </Badge>
    );
  } else if (type === "kubernetesCluster") {
    return (
      <Badge className=" !text-white" variant="outline">
        <Image
          src="/assets/kubernetes.svg"
          width={16}
          height={16}
          className="-ml-1.5 mr-1"
          alt="Kubernetes"
        />
        Kubernetes Cluster
      </Badge>
    );
  } else {
    return (
      <Badge className="!text-white" variant="outline">
        {type === "default" ? "Group" : "Subgroup"}
      </Badge>
    );
  }
};

// Utility function to build the full project hierarchy array
const buildProjectHierarchy = (project: ProjectDTO): ProjectDTO[] => {
  const hierarchy: ProjectDTO[] = [];
  let current: ProjectDTO | null = project;

  while (current) {
    hierarchy.unshift(current);
    current = current.parent;
  }

  return hierarchy;
};

// Utility function to get display name for a project
const getProjectDisplayName = (
  project: ProjectDTO,
  parent?: ProjectDTO,
): string => {
  if (parent) {
    return project.name.replace(parent.name + " /", "");
  }
  return project.name;
};

export const ProjectElement = ({
  project,
  activeOrg,
  isLast = false,
  parent,
}: {
  project: ProjectDTO;
  activeOrg: { slug: string; name: string };
  isLast?: boolean;
  parent?: ProjectDTO;
}) => {
  const displayName = getProjectDisplayName(project, parent);

  return (
    <>
      <Link
        className="flex flex-row items-center gap-1 !text-white hover:no-underline min-w-0"
        href={`/${activeOrg.slug}/projects/${project.slug}/`}
        title={displayName}
      >
        <span className="truncate">{truncateMiddle(displayName)}</span>
        <ProjectBadge type={project.type} />
      </Link>
      {!isLast && <span className="opacity-75 flex-shrink-0">/</span>}
    </>
  );
};

const ProjectTitle = () => {
  const activeOrg = useActiveOrg()!;
  const project = useActiveProject()!;

  const hierarchy = buildProjectHierarchy(project);
  const maxDisplay = 4;

  // If we have 4 or fewer projects, show them all
  if (hierarchy.length <= maxDisplay) {
    return (
      <span className="flex flex-row gap-2 min-w-0 overflow-hidden">
        {hierarchy.map((proj, index) => (
          <ProjectElement
            key={proj.slug}
            project={proj}
            activeOrg={activeOrg}
            isLast={index === hierarchy.length - 1}
            parent={index > 0 ? hierarchy[index - 1] : undefined}
          />
        ))}
      </span>
    );
  }

  // If we have more than 4 projects, show first 2, ellipsis, and last 2
  const firstTwo = hierarchy.slice(0, 2);
  const lastTwo = hierarchy.slice(-2);

  return (
    <span className="flex flex-row gap-2 min-w-0 overflow-hidden">
      {firstTwo.map((proj, index) => (
        <ProjectElement
          key={proj.slug}
          project={proj}
          activeOrg={activeOrg}
          isLast={false}
          parent={index > 0 ? hierarchy[index - 1] : undefined}
        />
      ))}

      <span
        className="opacity-75 flex-shrink-0"
        title={`${hierarchy.length - 4} more levels`}
      >
        ...
      </span>
      <span className="opacity-75 flex-shrink-0">/</span>

      {lastTwo.map((proj, index) => {
        const hierarchyIndex = hierarchy.length - 2 + index;
        return (
          <ProjectElement
            key={proj.slug}
            project={proj}
            activeOrg={activeOrg}
            isLast={index === lastTwo.length - 1}
            parent={
              hierarchyIndex > 0 ? hierarchy[hierarchyIndex - 1] : undefined
            }
          />
        );
      })}
    </span>
  );
};

export default ProjectTitle;
