"use client";

import Err from "../../../../components/common/Err";
import Loading from "../../../../components/common/Loading";
import { useOrganization } from "../../../../context/OrganizationContext";
import { useProject } from "../../../../context/ProjectContext";
import useApi from "../../../../hooks/useApi";
import ProjectPage from "./ProjectPage";

export default function Page() {
  const project = useProject();
  const organization = useOrganization();

  const { data, isLoading, error } = useApi<any>(
    `/organizations/${organization.organization.slug.replace("%40", "@")}/projects?parentId=${project?.id}`,
  );

  if (!project) {
    return null;
  }

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Err />;
  }

  return (
    <ProjectPage
      project={project}
      assets={project?.assets}
      subgroups={data.data || []}
    />
  );
}
