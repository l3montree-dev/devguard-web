// Copyright (C) 2023 Tim Bastin, Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
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

import { GetServerSidePropsContext } from "next";
import { FunctionComponent } from "react";
import Page from "../components/Page";
import { getApiClientFromContext } from "../services/flawFixApi";
import { OrganizationDTO } from "../types/api";
import { useStore } from "../zustand/globalStoreProvider";
import { withSession } from "../decorators/withSession";
import Section from "../components/common/Section";
import Link from "next/link";
interface Props {
  organizations: Array<OrganizationDTO>;
}

const Home: FunctionComponent<Props> = ({ organizations }) => {
  const store = useStore((s) => s);
  return (
    <Page hideNav title="Organizations">
      <Section title="Select the organization" description="Test">
        <div className="grid grid-cols-3 gap-4">
          {organizations.map((org) => (
            <Link key={org.id} href={`/${org.id}`}>
              <div className="bg-slate-800 p-5 rounded-md">
                <h1>{org.name}</h1>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </Page>
  );
};

export default Home;

export const getServerSideProps = withSession(
  async (session, context: GetServerSidePropsContext) => {
    const apiClient = getApiClientFromContext(context);
    const orgs: Array<OrganizationDTO> = await (
      await apiClient("/organizations")
    ).json();
    return {
      props: {
        // hide the contactPhoneNumber
        organizations: orgs.map((o) => ({
          ...o,
          contactPhoneNumber: null,
        })),
      },
    };
  },
);
