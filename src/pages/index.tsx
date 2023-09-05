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
import Link from "next/link";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import Page from "../components/Page";
import Button from "../components/common/Button";
import { userNavigation } from "../const/menus";
import { withSession } from "../decorators/withSession";
import { getApiClientFromContext } from "../services/flawFixApi";
import { OrganizationDTO } from "../types/api";
interface Props {
  organizations: Array<OrganizationDTO>;
}

const Home: FunctionComponent<Props> = ({ organizations }) => {
  const router = useRouter();
  const handleJoinOrganization = async (org: OrganizationDTO) => {
    router.push(`/${org.id}`);
  };
  return (
    <Page
      Button={<Button>New Organization</Button>}
      navigation={userNavigation}
      title="Organizations"
    >
      <div className="grid grid-cols-1 divide-y divide-white/10">
        {organizations.map((org) => (
          <Link
            className="text-white py-2  border-white/10 hover:no-underline  rounded-sm flex flex-row justify-between items-center transition-all"
            key={org.id}
            href={`/${org.slug}`}
          >
            <div className="w-full">
              <h1 className="font-medium items-center flex justify-between w-full flex-1">
                {org.name}{" "}
                <Link className="text-sm font-medium" href={`/${org.slug}/`}>
                  View Organization
                </Link>
              </h1>
              <p className="text-blue-200">{org.description}</p>
            </div>
            <div></div>
          </Link>
        ))}
      </div>
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
