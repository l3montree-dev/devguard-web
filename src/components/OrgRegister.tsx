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

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import type { OrganizationDTO, OrganizationDetailsDTO } from "../types/api/api";

import { browserApiClient } from "@/services/devGuardApi";
import { Form } from "./ui/form";

import { OrgForm } from "./OrgForm";
import { Button } from "./ui/button";
import AcceptInvitationDialog from "./AcceptInvitationDialog";

import { toast } from "@/lib/toast";
import { useUpdateSession } from "@/context/SessionContext";

export default function OrgRegisterForm() {
  const updateSession = useUpdateSession();
  const form = useForm<OrganizationDTO>();
  const [acceptInvitationOpen, setAcceptInvitationOpen] = useState(false);

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
      toast.error("Could not create organization", {
        description:
          "Organization creation is currently disabled or an error occurred. Please contact your administrator.",
      });
      return;
    }

    const orgDTO: OrganizationDetailsDTO = await resp.json();

    updateSession((prev) => ({
      ...prev,
      organizations: [...prev.organizations, orgDTO],
    }));

    toast.success("Organization created successfully");

    form.reset();

    localStorage.setItem("lastActiveOrg", orgDTO.slug);
    // move the user to the newly created organization
    setTimeout(() => router.push(`/${orgDTO.slug}`), 0);
  };

  return (
    <Form {...form}>
      <form
        className="text-black dark:text-white"
        onSubmit={form.handleSubmit(handleOrgCreation)}
      >
        <OrgForm autoFocus />

        <div className="mt-6 flex items-center justify-end gap-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setAcceptInvitationOpen(true)}
          >
            Join Organization
          </Button>
          <Button
            disabled={form.formState.isSubmitting}
            isSubmitting={form.formState.isSubmitting}
            type="submit"
          >
            Create Organization
          </Button>
        </div>
      </form>
      <AcceptInvitationDialog
        isOpen={acceptInvitationOpen}
        onOpenChange={setAcceptInvitationOpen}
      />
    </Form>
  );
}
