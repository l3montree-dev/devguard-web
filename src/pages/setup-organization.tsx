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

import OrgRegisterForm from "@/components/OrgRegisterForm";
import Page from "@/components/Page";
import { withOrg } from "../decorators/withOrg";
import { withSession } from "../decorators/withSession";
import { middleware } from "@/decorators/middleware";

export default function SetupOrg() {
  return (
    <Page title="Create your organization">
      <OrgRegisterForm />
    </Page>
  );
}

export const getServerSideProps = middleware(
  async () => {
    return {
      props: {},
    };
  },
  {
    session: withSession,
    organizations: withOrg,
  },
);
