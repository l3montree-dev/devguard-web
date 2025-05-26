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
import { useCallback, useEffect, useState } from "react";
import ListItem from "../components/common/ListItem";
import Section from "../components/common/Section";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { withSession } from "../decorators/withSession";
import { browserApiClient } from "../services/devGuardApi";
import { debounce } from "lodash";
import { Loader2 } from "lucide-react";
import Image from "next/image";

type Repo = {
  label: string;
  id: string;
  image: string;
  description: string;
};

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

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const repos = await listRepositories();
        setRepositories(repos);
      } catch (error) {
        console.error("Failed to fetch repositories:", error);
      }
    };

    fetchRepositories();
  }, [listRepositories]);
  return (
    <Page title="Setup DevGuard">
      <Section
        forceVertical
        title="Automatically setup one of your repositories"
      >
        <Input
          placeholder="Search for a repository"
          className="mb-4"
          type="text"
          onChange={(e) => {
            debouncedListRepositories(e.target.value);
          }}
        />
        {loading && (
          <div className="flex flex-row justify-center">
            <Loader2 className="animate-spin h-10 w-10 mr-2" />
          </div>
        )}
        {repositories.map((repo) => (
          <ListItem
            key={repo.label}
            Description={repo.description}
            Title={
              <span className="flex flex-row items-center gap-2">
                {repo.image && (
                  <img
                    src={repo.image}
                    width={32}
                    height={32}
                    alt={repo.label}
                    className="rounded-full"
                  />
                )}
                {repo.label}
              </span>
            }
            Button={<Button variant={"secondary"}>Automatically setup</Button>}
          ></ListItem>
        ))}
      </Section>
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
