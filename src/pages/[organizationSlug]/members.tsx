// Copyright 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { GetServerSideProps, GetServerSidePropsContext } from "next";

import Page from "@/components/Page";
import { withSession } from "@/decorators/withSession";

import Section from "@/components/common/Section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { middleware } from "@/decorators/middleware";
import { withContentTree } from "@/decorators/withContentTree";
import { withOrganization } from "@/decorators/withOrganization";
import { withOrgs } from "@/decorators/withOrgs";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import { classNames } from "@/utils/common";
import { useStore } from "@/zustand/globalStoreProvider";
import Link from "next/link";

export default function Members() {
  const activeOrg = useActiveOrg();

  const orgMenu = useOrganizationMenu();

  const contentTree = useStore((s) => s.contentTree);

  return (
    <Page
      title="Members"
      Title={
        <Link
          href={`/${activeOrg.slug}/projects`}
          className="flex flex-row items-center gap-1 !text-white hover:no-underline"
        >
          {activeOrg.name}{" "}
          <Badge
            className="font-body font-normal !text-white"
            variant="outline"
          >
            Organization
          </Badge>
        </Link>
      }
      Menu={orgMenu}
    >
      <Section
        forceVertical
        title="Members"
        description="Here you can find all the members of your organization."
      >
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead
              className={classNames("w-full text-left", "border-b bg-card")}
            >
              <tr className="">
                <th className="p-4">Avatar</th>
                <th className="p-4">Name</th>
                <th className="p-4">Role</th>
              </tr>
            </thead>
            <tbody>
              {activeOrg.members
                .filter(
                  (m) =>
                    !(m.id.startsWith("gitlab") || m.id.startsWith("github")),
                )
                .map((m, i, arr) => {
                  return (
                    <tr
                      className={classNames(
                        i % 2 !== 0 && "bg-card/75",
                        i + 1 !== arr.length && "border-b",
                      )}
                      key={m.id}
                    >
                      <td className="p-4">
                        <Avatar>
                          {Boolean(m?.avatarUrl) && (
                            <AvatarImage src={m?.avatarUrl} alt={m.name} />
                          )}
                          <AvatarFallback className="bg-secondary">
                            {m.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </td>
                      <td className="p-4">{m.name}</td>
                      <td className="p-4 capitalize">{m.role}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  );
}

export const getServerSideProps: GetServerSideProps = middleware(
  async (context: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    contentTree: withContentTree,
  },
);
