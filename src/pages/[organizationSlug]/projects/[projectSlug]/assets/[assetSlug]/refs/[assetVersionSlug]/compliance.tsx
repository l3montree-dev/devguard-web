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
import AssetTitle from "@/components/common/AssetTitle";
import CustomTab from "@/components/common/CustomTab";
import {
  bsiComplianceControls,
  isoComplianceControls,
} from "@/components/compliance/complianceElements";
import Page from "@/components/Page";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { Tab } from "@headlessui/react";

import AcceptedVulnerabilitiesTable from "@/components/common/AcceptedVulnerabilitiesTable";
import CollapsibleControlTrigger from "@/components/common/CollapsibleControlTrigger";
import Section from "@/components/common/Section";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withContentTree } from "@/decorators/withContentTree";
import { withOrganization } from "@/decorators/withOrganization";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { getApiClientFromContext } from "@/services/devGuardApi";
import { DetailedFlawDTO, Paged } from "@/types/api/api";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { BranchTagSelector } from "@/components/BranchTagSelector";

const Compliance = ({ flaws }: { flaws: Paged<DetailedFlawDTO> }) => {
  const menu = useAssetMenu();
  const asset = useActiveAsset()!;
  const branches = asset.branches;
  const tags = asset.tags;
  return (
    <Page Menu={menu} Title={<AssetTitle />} title="Dependencies">
      <div>
        <BranchTagSelector branches={branches} tags={tags} />
        <Section
          forceVertical
          primaryHeadline
          title="Compliance posture assessment"
          description="
        This section provides an overview of the compliance posture of the organization.
        It shows the number of assets that are compliant, non-compliant, and in the process of being validated."
        >
          <Section
            forceVertical
            title="Accepted Vulnerabilities"
            description="Vulnerabilities that have been accepted across the whole organization"
          >
            <AcceptedVulnerabilitiesTable flaws={flaws} />
          </Section>
          <Tab.Group>
            <Tab.List>
              <CustomTab>
                <div className="flex flex-row items-center">
                  <div className="absolute">
                    <div className="mr-2 bg-white p-0">
                      <div className="h-2 w-1 bg-black" />
                      <div className="h-2 w-1 bg-[#F61701]" />
                      <div className="h-2 w-1 bg-[#F9CC01]" />
                    </div>
                  </div>
                  <span className="pl-3">BSI Grundschutz</span>
                </div>
              </CustomTab>
              <CustomTab>
                <div className="flex flex-row items-center">
                  <div>
                    <Image
                      src="/assets/iso.svg"
                      width={24}
                      className="mr-2 inline"
                      height={24}
                      alt="ISO 27001"
                    />
                  </div>
                  <span>ISO 27001</span>
                </div>
              </CustomTab>
              <CustomTab>
                <div className="flex flex-row items-center">
                  <Image
                    src="/assets/NIST_logo.svg"
                    width={30}
                    height={24}
                    className="mr-2 inline dark:invert"
                    alt="NIST"
                  />

                  <span>Secure Software Development Framework (SSDF)</span>
                </div>
              </CustomTab>
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel className={"flex w-full flex-col gap-5"}>
                <p className="text-sm text-muted-foreground">
                  The BSI Grundschutz standard is a German standard that
                  provides a systematic approach to information security
                  management. It is based on a risk management approach and
                  provides a set of security controls that are designed to
                  protect information assets. The following outlines the
                  technical controls required for compliance with BSI
                  Grundschutz.
                </p>
                <div className="grid grid-cols-12 font-bold">
                  <div className="col-span-10">Control name</div>
                  <div className="text-right">Evidence</div>
                </div>

                {bsiComplianceControls(asset).con8.map((el) => (
                  <Collapsible key={el.control} title={el.control}>
                    <CollapsibleControlTrigger
                      currentEvidence={el.currentEvidence}
                      maxEvidence={el.maxEvidence}
                    >
                      <div className="grid w-full grid-cols-12 flex-row justify-between">
                        <div className="col-span-11 text-left">
                          {el.control}
                        </div>
                      </div>
                    </CollapsibleControlTrigger>
                    <div className="border-b">
                      <CollapsibleContent className=" py-2 text-sm">
                        <div className="text-muted-foreground">
                          {el.description}
                        </div>
                        {Boolean(el.Message) && (
                          <div className="mt-2">{el.Message}</div>
                        )}
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </Tab.Panel>
              <Tab.Panel className={"flex w-full flex-col gap-5"}>
                <p className="text-sm text-muted-foreground">
                  The ISO 27001 standard is a globally recognized benchmark for
                  information security management. It establishes a
                  comprehensive framework of best practices to help
                  organizations safeguard their information assets. The
                  following outlines the technical controls required for
                  compliance with ISO 27001.
                  <br /> While DevGuard does not support the implementation of
                  all these controls, it facilitates the implementation of any
                  control related to software development. The list below
                  explains each control and highlights the evidence DevGuard
                  collects to demonstrate that your company fulfills the
                  requirements of that control.
                </p>
                <div className="grid grid-cols-12 font-bold">
                  <div className="col-span-10">Control name</div>
                  <div>Evidence</div>
                </div>

                {isoComplianceControls.technologicalControls.map((el) => (
                  <Collapsible key={el.control} title={el.control}>
                    <CollapsibleControlTrigger
                      maxEvidence={el.maxEvidence}
                      currentEvidence={el.currentEvidence}
                    >
                      <div className="grid w-full grid-cols-12 flex-row justify-between">
                        <div className="col-span-11 text-left">
                          {el.control}
                        </div>
                      </div>
                    </CollapsibleControlTrigger>
                    <div className="border-b">
                      <CollapsibleContent className=" py-2 text-sm text-muted-foreground">
                        <div>{el.description}</div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </Tab.Panel>
              <Tab.Panel>
                <p className="text-sm text-muted-foreground">
                  The Secure Software Development Framework (SSDF) is a
                  framework developed by the National Institute of Standards and
                  Technology (NIST) to help organizations build secure software.
                  The SSDF provides a set of security controls that are designed
                  to protect software assets. The following outlines the
                  technical controls required for compliance with the SSDF.
                </p>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </Section>
      </div>
    </Page>
  );
};

export default Compliance;

export const getServerSideProps = middleware(
  async (context) => {
    const apiClient = getApiClientFromContext(context);

    const uri =
      "/organizations/" +
      context.params?.organizationSlug +
      "/projects/" +
      context.params?.projectSlug +
      "/assets/" +
      context.params?.assetSlug +
      "/refs/" +
      context.query.assetVersionSlug;

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
          flat: "true",
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
    project: withProject,
    asset: withAsset,
    contentTree: withContentTree,
  },
);
