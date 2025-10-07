import ProjectHeader from "@/components/common/ProjectHeader";
import React from "react";
import { ClientContextWrapper } from "../../../../../context/ClientContextWrapper";
import { ProjectProvider } from "../../../../../context/ProjectContext";
import { fetchProject } from "../../../../../data-fetcher/fetchProject";

export default async function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ organizationSlug: string; projectSlug: string }>;
}) {
  const { organizationSlug, projectSlug } = await params;
  const [project] = await Promise.all([
    fetchProject(organizationSlug, projectSlug),
  ]);

  return (
    <ClientContextWrapper Provider={ProjectProvider} value={project}>
      <ProjectHeader />
      {children}
    </ClientContextWrapper>
  );
}
