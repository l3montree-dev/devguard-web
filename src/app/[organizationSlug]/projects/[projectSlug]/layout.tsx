import React from "react";
import { ProjectProvider } from "../../../../context/ProjectContext";
import { withProject } from "../../../../decorators/withProject";
import { ClientContextWrapper } from "../../../../context/ClientContextWrapper";

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
    withProject(organizationSlug, projectSlug),
  ]);

  return (
    <ClientContextWrapper Provider={ProjectProvider} value={project}>
      {children}
    </ClientContextWrapper>
  );
}
