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
import { FunctionComponent, useState } from "react";
import Page from "../../components/Page";
import Button from "../../components/common/Button";
import { withInitialState } from "../../decorators/withInitialState";
import { withSession } from "../../decorators/withSession";
import { OrganizationDTO } from "../../types/api";
import { IActivityItem } from "../../types/common";
import { organizationNavigation } from "../../const/menus";
import Image from "next/image";
import ProjectList from "../../components/ProjectList";
import SingleStatGroup from "../../components/SingleStatGroup";
import { calculateActivityString } from "../../utils/activityFeed";
import { useStore } from "../../zustand/globalStoreProvider";
interface Props {
  organizations: Array<OrganizationDTO>;
}
const activityItems: { items: Array<IActivityItem> } = {
  items: [
    {
      id: 1,
      user: {
        name: "Tim Bastin",
        imageUrl: "/examples/tim.jpg",
      },
      projectName: "StampLab",
      cve: "CVE-2023-1234",
      newState: "verifiedFix",
      date: "1h",
      dateTime: "2023-01-23T11:00",
    },
    {
      id: 2,
      user: {
        name: "Sebastian Kawelke",
        imageUrl: "/examples/sebastian.jpg",
      },
      projectName: "StampLab",
      cve: "CVE-2023-1234",
      newState: "pendingFix",
      date: "1h",
      dateTime: "2023-01-23T11:00",
    },
    {
      id: 3,
      user: {
        name: "Frédéric Noppe",
        imageUrl: "/examples/frederic.jpg",
      },
      projectName: "StampLab",
      cve: "CVE-2023-1234",
      newState: "pendingFix",
      date: "1h",
      dateTime: "2023-01-23T11:00",
    },
    {
      id: 4,
      user: {
        name: "Tim Bastin",
        imageUrl: "/examples/tim.jpg",
      },
      projectName: "StampLab",
      cve: "CVE-2023-1234",
      newState: "verifiedFix",
      date: "1h",
      dateTime: "2023-01-23T11:00",
    },
  ],
};

const Home: FunctionComponent<Props> = () => {
  const [open, setOpen] = useState(false);
  const activeOrg = useStore((s) => s.activeOrganization);
  return (
    <Page
      Button={<Button>New Project</Button>}
      title={activeOrg?.name ?? "Loading..."}
    >
      <div>
        <SingleStatGroup />
      </div>
      <div>
        <ProjectList />
      </div>
    </Page>
  );
};

export default Home;

export const getServerSideProps = withSession(
  withInitialState(
    async (context: GetServerSidePropsContext, _, { organizations }) => {
      return {
        props: {},
      };
    },
  ),
);
