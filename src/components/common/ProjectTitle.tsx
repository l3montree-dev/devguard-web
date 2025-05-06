import Link from "next/link";
import React from "react";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { Badge } from "../ui/badge";
import { ProjectDTO } from "../../types/api/api";
import Image from "next/image";

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
        {type === "default" ? "Project" : "Subproject"}
      </Badge>
    );
  }
};

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
          href={`/${activeOrg.slug}/projects/${project.slug}/`}
        >
          {project.name}
          <ProjectBadge type={project.type} />
        </Link>
      </>
    );
  }
  return (
    <Link
      className="flex flex-row items-center gap-1 !text-white hover:no-underline"
      href={`/${activeOrg?.slug}/projects/${project.slug}/`}
    >
      {project.name}
      <ProjectBadge type={project.type} />
    </Link>
  );
};

const ProjectTitle = () => {
  const activeOrg = useActiveOrg()!;
  const project = useActiveProject()!;

  return (
    <span className="flex flex-row gap-2">
      <ProjectElement project={project} activeOrg={activeOrg} />
    </span>
  );
};

export default ProjectTitle;
