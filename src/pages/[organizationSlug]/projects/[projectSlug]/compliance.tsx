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
import { getApiClientFromContext } from "@/services/devGuardApi";

import DateString from "@/components/common/DateString";
import Section from "@/components/common/Section";
import { Badge } from "@/components/ui/badge";
import { middleware } from "@/decorators/middleware";
import { withContentTree } from "@/decorators/withContentTree";
import { withOrganization } from "@/decorators/withOrganization";
import { withOrgs } from "@/decorators/withOrgs";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import { DetailedFlawDTO, Paged } from "@/types/api/api";
import { classNames } from "@/utils/common";
import { normalizeContentTree } from "@/zustand/globalStore";
import { useStore } from "@/zustand/globalStoreProvider";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";

export default function Compliance({
  flaws,
}: {
  flaws: Paged<DetailedFlawDTO>;
}) {
  const activeOrg = useActiveOrg();
  const router = useRouter();
  const orgMenu = useOrganizationMenu();

  const contentTree = useStore((s) => s.contentTree);
  const assetMap = useMemo(
    () => normalizeContentTree(contentTree ?? []),
    [contentTree],
  );
  return (
    <Page
      title="Compliance"
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
        title="Accepted Vulnerabilities"
        description="Vulnerabilities that have been accepted across the whole organization"
      >
        <div className="rounded-lg border">
          <table className="w-full  text-sm">
            <thead
              className={classNames("w-full text-left", "border-b bg-card")}
            >
              <tr className="">
                <th className="p-4">CVE</th>
                <th className="p-4">Risk</th>
                <th className="p-4">Asset</th>
                <th className="p-4">Accepted at</th>
                <th className="p-4">Justification</th>
              </tr>
            </thead>
            <tbody>
              {flaws.data.map((flaw, i) => {
                const acceptedEvent = flaw.events.findLast(
                  (e) => e.type === "accepted",
                );
                return (
                  <tr
                    className={classNames(
                      "cursor-pointer",
                      i % 2 !== 0
                        ? "bg-card/75 hover:bg-card"
                        : "hover:bg-card/50",
                      i + 1 !== flaws.data.length && "border-b",
                    )}
                    key={flaw.id}
                    onClick={() => {
                      router.push(
                        `/${activeOrg.slug}/projects/${assetMap[flaw.assetId].project.slug}/assets/${assetMap[flaw.assetId]?.slug}/flaws/${flaw.id}`,
                      );
                    }}
                  >
                    <td className="p-4">{flaw.cveId}</td>
                    <td className="p-4">{flaw.rawRiskAssessment}</td>
                    <td className="p-4">
                      <Link
                        onClick={(e) => e.stopPropagation()}
                        href={`/${activeOrg.slug}/projects/${assetMap[flaw.assetId].project.slug}/assets/${assetMap[flaw.assetId]?.slug}`}
                      >
                        <Badge variant={"outline"}>
                          {assetMap[flaw.assetId]?.title}
                        </Badge>
                      </Link>
                    </td>
                    <td className="p-4">
                      {acceptedEvent && (
                        <DateString date={new Date(acceptedEvent.createdAt)} />
                      )}
                    </td>
                    <td className="p-4">{acceptedEvent?.justification}</td>
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
  async (context: GetServerSidePropsContext, { organizations }) => {
    // fetch the project
    const { organizationSlug, projectSlug, assetSlug } = context.params!;

    const apiClient = getApiClientFromContext(context);

    const uri =
      "/organizations/" + organizationSlug + "/projects/" + projectSlug;

    const filterQuery = Object.fromEntries(
      Object.entries(context.query).filter(
        ([k]) => k.startsWith("filterQuery[") || k.startsWith("sort["),
      ),
    );

    filterQuery["filterQuery[state][is]"] = "accepted";

    // check for page and page size query params
    // if they are there, append them to the uri
    const page = (context.query.page as string) ?? "1";
    const pageSize = (context.query.pageSize as string) ?? "25";
    const flawResp = await apiClient(
      uri +
        "/flaws/?" +
        new URLSearchParams({
          page,
          pageSize,
          ...(context.query.search
            ? { search: context.query.search as string }
            : {}),
          ...filterQuery,
        }),
    );

    // fetch a personal access token from the user

    const flaws = await flawResp.json();

    return {
      props: {
        flaws,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    contentTree: withContentTree,
  },
);
