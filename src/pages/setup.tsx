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
import { debounce } from "lodash";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ListItem from "../components/common/ListItem";
import Section from "../components/common/Section";
import { AsyncButton } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { withSession } from "../decorators/withSession";
import { browserApiClient } from "../services/devGuardApi";

type Repo = {
  label: string;
  id: string;
  image: string;
  description: string;
};

function sortRepositories(repositories: Array<Repo>) {
  repositories.sort((a, b) => {
    if (a.label.toLowerCase() < b.label.toLowerCase()) return -1;
    if (a.label.toLowerCase() > b.label.toLowerCase()) return 1;
    return 0;
  });
}

export default function SetupOrg() {
  const [loading, setLoading] = useState(false);
  const [repositories, setRepositories] = useState<Array<Repo>>([]);

  const listRepositories = useCallback(async (search?: string) => {
    setLoading(true);
    // fetch the repositories of the user
    const resp = await browserApiClient(
      "/integrations/repositories" + (search ? `?search=${search}` : ""),
    );
    setLoading(false);
    return resp.json() as Promise<Array<Repo>>;
  }, []);

  const debouncedListRepositories = useCallback(
    debounce(async (search: string) => {
      setRepositories(await listRepositories(search));
    }, 300),
    [listRepositories],
  );

  const handleAutoSetup = async (repoId: string) => {
    return browserApiClient("/integrations/fullautosetup", {
      method: "POST",
      body: JSON.stringify({
        repositoryId: repoId,
      }),
    });
  };

  return (
    <Page title="Setup DevGuard">
      <OrgRegisterForm />
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
