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
import Page from "../components/Page";
import { getApiClientFromContext } from "../services/flawFixApi";
import { withSession } from "../services/ory";
import { useStore } from "../zustand/globalStoreProvider";

export default function Home() {
  const store = useStore((s) => s);

  return <Page title=""></Page>;
}

export const getServerSideProps = withSession(
  async (session, context: GetServerSidePropsContext) => {
    const apiClient = getApiClientFromContext(context);
    console.log("orgs", await (await apiClient("/organizations")).json());
    return {
      props: {},
    };
  },
);
