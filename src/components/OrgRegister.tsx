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
import { UseFormReturn, useForm } from "react-hook-form";
import { countries, industryOptions } from "../const/organizationConstants";
import { OrganizationDTO, OrganizationDetailsDTO } from "../types/api/api";
import Section from "./common/Section";

import { browserApiClient } from "@/services/devGuardApi";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "./ui/form";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import { Button } from "./ui/button";
import { OrgForm } from "./OrgForm";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useStore } from "@/zustand/globalStoreProvider";

interface Props {

}


export default function OrgRegisterForm(props: Props) {
  const activeOrg = useActiveOrg();
  const updateOrganization = useStore((s) => s.updateOrganization);
  const form = useForm<OrganizationDTO>();

  const router = useRouter();
  const handleOrgCreation = async (data: OrganizationDTO) => {
    const resp: OrganizationDTO = await (
      await browserApiClient("/organizations/", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          numberOfEmployees: !!data.numberOfEmployees
            ? Number(data.numberOfEmployees)
            : undefined,
        }),
      })
    ).json();


    updateOrganization(resp as OrganizationDetailsDTO);

    // move the user to the newly created organization
    router.push(`/${resp.slug}`);
  };

  return (
    <Form {...form}>
      <form
        className="text-black dark:text-white"
        onSubmit={form.handleSubmit(handleOrgCreation)}
      >


        <OrgForm form={form} />

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
