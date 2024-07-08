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
import { countries, industryOptions } from "../const/organizationConstants";
import { OrganizationDTO } from "../types/api/api";
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

interface Props {}

export default function OrgRegisterForm(props: Props) {
  const form = useForm<OrganizationDTO & { permission: boolean }>();

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

    // move the user to the newly created organization
    router.push(`/${resp.slug}`);
  };

  return (
    <Form {...form}>
      <form
        className="text-black dark:text-white"
        onSubmit={form.handleSubmit(handleOrgCreation)}
      >
        <Section
          description="General and required information about your organization."
          title="Required Information"
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <FormField
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="permission"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border bg-card p-4">
                      <div className="space-y-0.5 ">
                        <FormLabel className="text-base">Permission</FormLabel>
                        <FormDescription>
                          I am authorized to create an organization account on
                          behalf of my organization. For legal entities, I have
                          a right of representation.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </Section>

        <Section
          description="Help us to improve DevGuard."
          title="Optional Information"
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <FormField
                control={form.control}
                name="contactPhoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact phone number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+49 123 456 789"
                        autoComplete="tel"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="sm:col-span-3">
              <FormField
                control={form.control}
                name="numberOfEmployees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Employees</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Select autoComplete="country-name" {...field}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select the country your company is registered in" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-3">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        autoComplete="industry-name"
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {industryOptions.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="mt-10">
            <h2 className="font-semibold">
              Do you have to comply with any of the following regulations/
              standards?
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <FormField
                name="criticalInfrastructure"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border bg-card p-4">
                    <div className="space-y-0.5 ">
                      <FormLabel>Criticial Infrastructure (KRITIS)</FormLabel>
                      <FormDescription>
                        KRITIS (short for &quot;Kritische Infrastrukturen&quot;)
                        refers to critical infrastructures in Germany,
                        encompassing essential services and facilities in
                        sectors such as energy, water, food, health, and
                        finance, whose failure would have significant impacts on
                        public safety and national security.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        onCheckedChange={field.onChange}
                        checked={field.value}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="iso27001"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border bg-card p-4">
                    <div className="space-y-0.5 ">
                      <FormLabel>ISO 27001</FormLabel>
                      <FormDescription>
                        ISO 27001 is an international standard for managing
                        information security, providing a systematic approach to
                        securing sensitive data through the implementation of an
                        Information Security Management System (ISMS).
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        onCheckedChange={field.onChange}
                        checked={field.value}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="grundschutz"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border bg-card p-4">
                    <div className="space-y-0.5 ">
                      <FormLabel>
                        IT-Grundschutz (German Federal Office for Information
                        Security)
                      </FormLabel>
                      <FormDescription>
                        The BSI IT-Grundschutz is a framework developed by the
                        German Federal Office for Information Security (BSI)
                        that provides a comprehensive approach to managing
                        information security through standardized procedures and
                        protective measures.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        onCheckedChange={field.onChange}
                        checked={field.value}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="nist"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border bg-card p-4">
                    <div className="space-y-0.5 ">
                      <FormLabel>NIST Cybersecurity Framework</FormLabel>
                      <FormDescription>
                        The NIST Cybersecurity Framework is a set of guidelines
                        and best practices designed to help organizations
                        identify, protect, detect, respond to, and recover from
                        cybersecurity threats.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        onCheckedChange={field.onChange}
                        checked={field.value}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Section>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
