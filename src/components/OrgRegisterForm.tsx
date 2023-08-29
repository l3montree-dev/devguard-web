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
import { getApiClient } from "../services/flawFixApi";
import { OrganizationDTO } from "../types/api";
import Button from "./common/Button";
import Checkbox from "./common/Checkbox";
import Input from "./common/Input";
import Section from "./common/Section";
import Select from "./common/Select";

export default function OrgRegisterForm() {
  const { register, handleSubmit } = useForm<
    OrganizationDTO & { permission: string }
  >();

  const router = useRouter();
  const handleOrgCreation = async (data: OrganizationDTO) => {
    const client = getApiClient(document);

    const resp: OrganizationDTO = await (
      await client("/organizations", {
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
    <form onSubmit={handleSubmit(handleOrgCreation)}>
      <Section
        description="General and required information about your organization."
        title="Required Information"
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <Input
              type="text"
              label="Organization name *"
              autoComplete="organization"
              placeholder="FlawFix Inc."
              {...register("name", { required: true })}
            />
          </div>
        </div>

        <div className="mt-6">
          <Checkbox
            type="checkbox"
            label="Permission *"
            help="I am authorized to create an organization account on behalf of
                my organization. For legal entities, I have a right of
                representation."
            {...register("permission", { required: true })}
          />
        </div>
      </Section>

      <Section
        description="Help us to improve FlawFix."
        title="Optional Information"
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <Input
              type="text"
              name="tel"
              label="Contact phone number"
              id="tel"
              autoComplete="tel"
              placeholder="+49 123 456 789"
            />
          </div>
          <div className="sm:col-span-3">
            <Input
              label="Number of employees"
              type="number"
              {...register("numberOfEmployees")}
            />
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <Select
              label="Country"
              autoComplete="country-name"
              {...register("country")}
            >
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>
          </div>

          <div className="sm:col-span-3">
            <Select
              label="Industry"
              autoComplete="industry-name"
              {...register("industry")}
            >
              {industryOptions.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="mt-10">
          <span className="text-sm font-semibold leading-6 text-white">
            Do you have to comply with any of the following regulations/
            standards?
          </span>
          <div className="mt-4 space-y-4">
            <Checkbox
              label="Critical infrastructures ( KRITIS )"
              {...register("criticalInfrastructure")}
            />
            <Checkbox {...register("iso27001")} label="ISO 27001" />
            <Checkbox
              label="IT-Grundschutz (German Federal Office for Information Security)"
              {...register("grundschutz")}
            />
            <Checkbox
              {...register("nist")}
              label="NIST Cybersecurity Framework"
            />
          </div>
        </div>
      </Section>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
