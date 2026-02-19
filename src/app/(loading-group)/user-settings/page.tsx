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

import { Settings } from "@ory/elements-react/theme";
import { getSettingsFlow, OryPageParams } from "@ory/nextjs/app";
import oryConfig from "@/ory.config";
import Page from "../../../components/Page";
import Section from "../../../components/common/Section";
import { oryComponentOverrides } from "../../../components/ory/overrides";
import PatManagementSection from "./PatManagementSection";

const SettingsPage = async (props: OryPageParams) => {
  const flow = await getSettingsFlow(oryConfig, props.searchParams);

  if (!flow) {
    return null;
  }

  return (
    <Page title="Profile Management and Security Settings">
      <div className="dark:text-white">
        <Settings
          config={oryConfig}
          flow={flow as any}
          components={oryComponentOverrides}
        />

        <PatManagementSection />
      </div>
    </Page>
  );
};

export default SettingsPage;
