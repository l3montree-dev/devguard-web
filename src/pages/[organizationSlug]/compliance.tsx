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

import CustomTab from "@/components/common/CustomTab";
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
import { Tab } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import {
  bsiComplianceControls,
  isoComplianceControls,
} from "@/components/compliance/complianceElements";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import Callout from "@/components/common/Callout";

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
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead
              className={classNames("w-full text-left", "border-b bg-card")}
            >
              <tr className="">
                <th className="p-4">CVE</th>
                <th className="p-4">Risk</th>
                <th className="p-4">Asset</th>
                <th className="p-4">Accepted at</th>
                <th className="p-4">Automatically reopened for revalidation</th>
                <th className="p-4">Justification</th>
              </tr>
            </thead>
            <tbody>
              {flaws.data.map((flaw, i) => {
                const acceptedEvent = flaw.events.findLast(
                  (e) => e.type === "accepted",
                );

                const revalidationDate = acceptedEvent
                  ? new Date(acceptedEvent.createdAt).setDate(
                      new Date(acceptedEvent.createdAt).getDate() + 4 * 30,
                    )
                  : null;
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
                    <td className="p-4">
                      {revalidationDate && (
                        <DateString date={new Date(revalidationDate)} />
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
      <Section
        forceVertical
        title="Compliance posture assessment"
        description="
        This section provides an overview of the compliance posture of the organization.
        It shows the number of assets that are compliant, non-compliant, and in the process of being validated."
      >
        <Tab.Group>
          <Tab.List>
            <CustomTab>
              <div className="flex flex-row items-center">
                <div className="mr-2 bg-white p-0">
                  <div className="h-2 w-1 bg-black" />
                  <div className="h-2 w-1 bg-[#F61701]" />
                  <div className="h-2 w-1 bg-[#F9CC01]" />
                </div>
                <span>BSI Grundschutz</span>
              </div>
            </CustomTab>
            <CustomTab>
              <div className="flex flex-row items-center">
                <Image
                  src="/assets/iso.svg"
                  width={24}
                  className="mr-2 inline"
                  height={24}
                  alt="ISO 27001"
                />
                <span>ISO 27001</span>
              </div>
            </CustomTab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel className={"flex w-full flex-col gap-5"}>
              <p className="text-sm text-muted-foreground">
                The BSI Grundschutz standard is a German standard that provides
                a systematic approach to information security management. It is
                based on a risk management approach and provides a set of
                security controls that are designed to protect information
                assets. The following outlines the technical controls required
                for compliance with BSI Grundschutz.
              </p>
              <div className="grid grid-cols-12 font-bold">
                <div className="col-span-10">Control name</div>
                <div className="text-right">Evidence</div>
              </div>

              {bsiComplianceControls.con8.map((el) => (
                <Collapsible key={el.control} title={el.control}>
                  <CollapsibleTrigger className="w-full  py-2">
                    <div className="grid w-full grid-cols-12 flex-row justify-between">
                      <div className="col-span-10 text-left">{el.control}</div>
                      <div className="col-span-1 flex flex-row justify-end gap-2">
                        {el.currentEvidence}/{el.maxEvidence}{" "}
                        {el.maxEvidence !== 0 &&
                        el.currentEvidence === el.maxEvidence ? (
                          <CheckCircleIcon className="w-5 text-green-500" />
                        ) : (
                          <CheckCircleIcon className="w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="col-span-1 flex flex-row justify-end text-right">
                        <CaretDownIcon width={24} height={24} />
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <div className="border-b">
                    <CollapsibleContent className=" py-2 text-sm">
                      <div className="text-muted-foreground">
                        {el.description}
                      </div>
                      {Boolean(el.howDevguardHelps) && (
                        <div className="mt-2">
                          <Callout intent="success">
                            <div>{el.howDevguardHelps}</div>
                          </Callout>
                        </div>
                      )}
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </Tab.Panel>
            <Tab.Panel className={"flex w-full flex-col gap-5"}>
              <p className="text-sm text-muted-foreground">
                The ISO 27001 standard is a globally recognized benchmark for
                information security management. It establishes a comprehensive
                framework of best practices to help organizations safeguard
                their information assets. The following outlines the technical
                controls required for compliance with ISO 27001.
                <br /> While DevGuard does not support the implementation of all
                these controls, it facilitates the implementation of any control
                related to software development. The list below explains each
                control and highlights the evidence DevGuard collects to
                demonstrate that your company fulfills the requirements of that
                control.
              </p>
              <div className="grid grid-cols-12 font-bold">
                <div className="col-span-10">Control name</div>
                <div>Evidence</div>
              </div>

              {isoComplianceControls.technologicalControls.map((el) => (
                <Collapsible key={el.control} title={el.control}>
                  <CollapsibleTrigger className="w-full  py-2">
                    <div className="grid w-full grid-cols-12 flex-row justify-between">
                      <div className="col-span-10 text-left">{el.control}</div>
                      <div className="col-span-1 flex flex-row justify-end gap-2">
                        {el.currentEvidence}/{el.maxEvidence}{" "}
                        {el.maxEvidence !== 0 &&
                        el.currentEvidence === el.maxEvidence ? (
                          <CheckCircleIcon className="w-5 text-green-500" />
                        ) : (
                          <CheckCircleIcon className="w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="col-span-1 flex flex-row justify-end text-right">
                        <CaretDownIcon width={24} height={24} />
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <div className="border-b">
                    <CollapsibleContent className=" py-2 text-sm text-muted-foreground">
                      <div>{el.description}</div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </Section>
    </Page>
  );
}

export const getServerSideProps: GetServerSideProps = middleware(
  async (context: GetServerSidePropsContext, { organizations }) => {
    // fetch the project
    const { organizationSlug, projectSlug, assetSlug } = context.params!;

    const apiClient = getApiClientFromContext(context);

    const uri = "/organizations/" + organizationSlug;

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
