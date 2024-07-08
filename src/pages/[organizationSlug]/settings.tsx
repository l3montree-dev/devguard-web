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

import { middleware } from "@/decorators/middleware";
import { GetServerSidePropsContext } from "next";
import { FunctionComponent } from "react";
import Page from "../../components/Page";
import { withOrg } from "../../decorators/withOrg";
import { withSession } from "../../decorators/withSession";
import { useActiveOrg } from "../../hooks/useActiveOrg";

import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";

const Home: FunctionComponent = () => {
  const activeOrg = useActiveOrg();
  const orgMenu = useOrganizationMenu();

  return <Page title={activeOrg.name ?? "Loading..."} Menu={orgMenu}></Page>;
};

export default Home;

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  },
  {
    session: withSession,
    organizations: withOrg,
  },
);
