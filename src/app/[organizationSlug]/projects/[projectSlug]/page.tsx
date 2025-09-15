"use client";

import useSWR from "swr";
import {
  isOrganization,
  useOrganization,
} from "../../../../context/OrganizationContext";
import { useProject } from "../../../../context/ProjectContext";
import { fetcher } from "../../../../hooks/useApi";
import RepositoryPage from "./RepositoriesPage";

export default function Page() {
  const project = useProject()!;
  const organization = useOrganization();

  const { data } = useSWR<any>(
    () =>
      isOrganization(organization.organization)
        ? `/organizations/${organization.organization.slug.replace("%40", "@")}/projects?parentId=${project?.id}`
        : null,
    fetcher,
    { suspense: true },
  );

  return (
    <RepositoryPage
      project={project}
      assets={project?.assets}
      subgroups={data.data || []}
    />
  );
}
