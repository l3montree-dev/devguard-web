// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import CopyInput from "@/components/common/CopyInput";
import { ProjectForm } from "@/components/project/ProjectForm";
import { Label } from "@/components/ui/label";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useProjectUpdate } from "@/hooks/useProjectUpdate";
import type { ProjectDTO } from "@/types/dto";
import { FormProvider, useForm } from "react-hook-form";

const ProjectGeneralSettings = () => {
  const project = useActiveProject()!;
  const handleUpdate = useProjectUpdate();
  const form = useForm<ProjectDTO>({ defaultValues: project });

  return (
    <>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleUpdate)}>
          <ProjectForm
            form={form}
            onUpdate={handleUpdate}
            forceVerticalSections
          />
        </form>
      </FormProvider>
      <Label>Group ID</Label>
      <CopyInput value={project.id} />
    </>
  );
};

export default ProjectGeneralSettings;
