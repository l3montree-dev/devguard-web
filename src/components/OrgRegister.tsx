// Copyright (C) 2023 Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { OrganizationDTO, OrganizationDetailsDTO } from "../types/api/api";

import { browserApiClient } from "@/services/devGuardApi";
import { Form } from "./ui/form";

import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useStore } from "@/zustand/globalStoreProvider";
import { OrgForm } from "./OrgForm";
import { Button } from "./ui/button";

import { toast } from "sonner";

interface Props {}

export default function OrgRegisterForm(props: Props) {
  const updateOrganization = useStore((s) => s.updateOrganization);
  const form = useForm<OrganizationDTO>();

  const router = useRouter();
  const handleOrgCreation = async (data: OrganizationDTO) => {
    const resp = await browserApiClient("/organizations/", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        numberOfEmployees: !!data.numberOfEmployees
          ? Number(data.numberOfEmployees)
          : undefined,
      }),
    });

    if (resp.status !== 200) {
      const error = await resp.json();
      toast.error("Error creating organization", {
        description: error,
      });
      return;
    }

    const orgDTO: OrganizationDetailsDTO = await resp.json();

    updateOrganization(orgDTO);

    // move the user to the newly created organization
    router.push(`/${orgDTO.slug}`);
  };

  return (
    <Form {...form}>
      <form
        className="text-black dark:text-white"
        onSubmit={form.handleSubmit(handleOrgCreation)}
      >
        <OrgForm form={form} />

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button
            disabled={form.formState.isSubmitting}
            isSubmitting={form.formState.isSubmitting}
            type="submit"
          >
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
