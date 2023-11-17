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
import { FunctionComponent, useState } from "react";
import Page from "../components/Page";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import { userNavigation } from "../const/menus";
import { withSession } from "../decorators/withSession";
import { getApiClientFromContext } from "../services/flawFixApi";
import { OrganizationDTO } from "../types/api";
import SetupOrg from "./setup-org";
import OrgRegisterForm from "../components/OrgRegisterForm";
import { withInitialState } from "../decorators/withInitialState";
interface Props {
  organizations: Array<OrganizationDTO>;
}

const Home: FunctionComponent<Props> = () => {
  const [open, setOpen] = useState(false);
  return (
    <Page
      Button={<Button onClick={() => setOpen(true)}>New Organization</Button>}
      navigation={userNavigation}
      title="Organizations"
    >
      <Modal title="Create new Organization" open={open} setOpen={setOpen}>
        <OrgRegisterForm />
      </Modal>
      <div className="grid grid-cols-1 divide-y divide-white/10"></div>
    </Page>
  );
};

export default Home;

export const getServerSideProps = withSession(
  withInitialState(async (context: GetServerSidePropsContext, session) => {
    return {
      props: {},
    };
  }),
);
