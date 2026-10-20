// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { OrgForm } from "@/components/OrgForm";
import { Button } from "@/components/ui/button";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useOrgUpdate } from "@/hooks/useOrgUpdate";
import type { OrganizationDetailsDTO } from "@/types/dto";
import { FormProvider, useForm } from "react-hook-form";

const OrgGeneralSettings = () => {
  const org = useActiveOrg() as OrganizationDetailsDTO;
  const handleUpdate = useOrgUpdate();
  const form = useForm<OrganizationDetailsDTO>({ defaultValues: org });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleUpdate)}>
        <OrgForm withSection={false} />
        <div className="mt-6 flex justify-end">
          <Button isSubmitting={form.formState.isSubmitting} type="submit">
            Save
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default OrgGeneralSettings;
