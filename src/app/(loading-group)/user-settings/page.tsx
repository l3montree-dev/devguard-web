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

import { fetchSession } from "@/data-fetcher/fetchSession";
import oryConfig from "@/ory.config";
import { getSettingsFlow } from "@ory/nextjs/app";
import type { OryPageParams } from "@ory/nextjs/app";
import { redirect } from "next/navigation";
import Page from "../../../components/Page";
import UserSettings from "../../../components/UserSettings";
import PatManagementSection from "./PatManagementSection";

const SettingsPage = async (props: OryPageParams) => {
  if (!(await fetchSession())) {
    redirect("/login?return_to=/user-settings");
  }

  const flow = await getSettingsFlow(oryConfig, props.searchParams);

  if (!flow) {
    return null;
  }

  return (
    <Page title="Profile Management and Security Settings">
      <div className="dark:text-white">
        <UserSettings flow={flow as any} config={oryConfig} />
        <PatManagementSection />
      </div>
    </Page>
  );
};

export default SettingsPage;
