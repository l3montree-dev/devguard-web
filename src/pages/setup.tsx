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

import OrgRegisterForm from "@/components/OrgRegister";
import Page from "@/components/Page";
import { middleware } from "@/decorators/middleware";
import { withOrgs } from "@/decorators/withOrgs";
import { withSession } from "../decorators/withSession";
import Lanyard from "@/components/misc/Lanyard";

export default function SetupOrg() {
  return (
    <Page title="Setup Your Organization">
      <div className="">
        <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
          <div className="">
            <div className="absolute inset-0 z-10 -top-10 w-1/2">
              <Lanyard position={[0, 0, 20]} gravity={[0, -40, 0]} />
            </div>
          </div>
          <div className="px-6 pb-24 pt-20 sm:pb-32 lg:px-8 lg:py-48">
            <div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
              <h2 className="text-3xl font-bold text-foreground">
                Create your VIP-Area in the
                <br />
                DevGuard Universe
              </h2>
              <OrgRegisterForm />
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

export const getServerSideProps = middleware(
  async (ctx, { session }) => {
    if (!session) {
      return {
        redirect: {
          destination: `/login`,
          permanent: false,
        },
      };
    }

    return {
      props: {},
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
  },
);
