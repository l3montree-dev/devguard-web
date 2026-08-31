// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import ProjectHeader from "@/components/common/ProjectHeader";
import React, { Suspense } from "react";
import { ClientContextWrapper } from "../../../../../context/ClientContextWrapper";
import { ProjectProvider } from "../../../../../context/ProjectContext";
import { fetchProject } from "../../../../../data-fetcher/fetchProject";
import { handleHttpError } from "../../../../../data-fetcher/handleHttpError";

export default function ProjectLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ organizationSlug: string; projectSlug: string }>;
}) {
  return (
    <Suspense>
      <ProjectShell params={params}>{children}</ProjectShell>
    </Suspense>
  );
}

async function ProjectShell({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ organizationSlug: string; projectSlug: string }>;
}) {
  const { organizationSlug, projectSlug } = await params;
  let project;
  try {
    project = await fetchProject(
      decodeURIComponent(organizationSlug),
      projectSlug,
    );
  } catch (error) {
    handleHttpError(error, organizationSlug);
  }

  return (
    <ClientContextWrapper Provider={ProjectProvider} value={project}>
      <ProjectHeader />
      {children}
    </ClientContextWrapper>
  );
}
