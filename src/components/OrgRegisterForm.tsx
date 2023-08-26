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

import { countries, industryOptions } from "../const/organizationConstants";
import Button from "./common/Button";
import Checkbox from "./common/Checkbox";
import Input from "./common/Input";
import Section from "./common/Section";
import Select from "./common/Select";

export default function OrgRegisterForm() {
  return (
    <form>
      <Section
        description="General and required information about your organization."
        title="Required Information"
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <Input
              required
              type="text"
              label="Organization name *"
              name="organization"
              id="organization"
              autoComplete="organization"
              placeholder="My cool organization..."
            />
          </div>
        </div>

        <div className="mt-6">
          <Checkbox
            name="permission"
            type="checkbox"
            required
            label="Permission *"
            help="I am authorized to create an organization account on behalf of
                my organization. For legal entities, I have a right of
                representation."
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
              name="number-of-employees"
              id="number-of-employees"
            />
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <Select
              label="Country"
              id="country"
              name="country"
              autoComplete="country-name"
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
              id="industry"
              name="industry"
              autoComplete="industry-name"
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
              name="comments"
              type="checkbox"
              label="Critical infrastructures ( KRITIS )"
            />
            <Checkbox name="candidates" type="checkbox" label="ISO 27001" />
            <Checkbox
              name="candidates"
              type="checkbox"
              label="IT-Grundschutz (German Federal Office for Information Security)"
            />
            <Checkbox
              name="candidates"
              type="checkbox"
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
