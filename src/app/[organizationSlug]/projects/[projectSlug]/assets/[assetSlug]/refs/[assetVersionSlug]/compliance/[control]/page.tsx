import Page from "@/components/Page";

import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { getApiClientFromContext } from "@/services/devGuardApi";
import { PolicyEvaluation } from "@/types/api/api";

import { useAssetMenu } from "@/hooks/useAssetMenu";
import { GetServerSidePropsContext } from "next";
import { FunctionComponent } from "react";
import Markdown from "react-markdown";

import { withOrganization } from "@/decorators/withOrganization";

import AssetTitle from "@/components/common/AssetTitle";
import { withAssetVersion } from "@/decorators/withAssetVersion";
import { withContentTree } from "@/decorators/withContentTree";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { TriangleAlert, XIcon } from "lucide-react";
import usePersonalAccessToken from "../../../../../../../../../../hooks/usePersonalAccessToken";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../../../../../../../../components/ui/collapsible";
import CopyCode, {
  CopyCodeFragment,
} from "../../../../../../../../../../components/common/CopyCode";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../../../../../../components/ui/card";
import ColoredBadge from "../../../../../../../../../../components/common/ColoredBadge";
import { violationLengthToLevel } from "../../../../../../compliance/compliance";
import PatSection from "../../../../../../../../../../components/PatSection";

interface Props {
  policyDetails: PolicyEvaluation;
}

const Index: FunctionComponent<Props> = (props) => {
  const assetMenu = useAssetMenu();

  const pat = usePersonalAccessToken();
  return (
    <Page
      Menu={assetMenu}
      Title={<AssetTitle />}
      title={props.policyDetails.title}
    >
      <div className="flex flex-row gap-4">
        <div className="flex-1">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <h1 className="text-2xl font-semibold">
                {props.policyDetails.title}
              </h1>
              <div className="mt-4 text-muted-foreground">
                <Markdown>
                  {props.policyDetails.description.replaceAll("\n", "\n\n")}
                </Markdown>
              </div>

              <div>
                <Collapsible className="bg-secondary border rounded-lg mt-4">
                  <CollapsibleTrigger className="w-full flex justify-between items-center text-left font-semibold rounded-lg px-2 py-1 ">
                    <span>Expand policy as code</span>
                    <ChevronDownIcon className="h-4 w-4 ml-2 inline-block" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CopyCode
                      language="rego"
                      codeString={props.policyDetails.rego}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </div>
              {props.policyDetails.compliant === false ? (
                <div className="text-sm">
                  <h2 className="mt-8 text-lg font-semibold">
                    Control evaluation result
                  </h2>
                  <div className="flex flex-col gap-2 mt-4">
                    {props.policyDetails.violations?.map((violation) => (
                      <div
                        key={violation}
                        className="flex flex-row items-center gap-2 rounded-lg border p-2"
                      >
                        <XIcon className="h-4 w-4 text-red-500" />
                        {violation}
                      </div>
                    ))}
                  </div>
                </div>
              ) : props.policyDetails.compliant === true ? (
                <div className="text-sm">
                  <h2 className="mt-8 text-lg font-semibold">
                    Control evaluation result
                  </h2>
                  <div className="flex flex-row items-center gap-2 rounded-lg border p-2 mt-4">
                    <CheckBadgeIcon className="h-4 w-4 text-green-500" />
                    Your asset is compliant with this control
                  </div>
                </div>
              ) : (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold">
                    No attestation available
                  </h2>
                  <div className="flex items-start flex-row  gap-2 rounded-lg border p-2 mt-4">
                    <TriangleAlert className="h-4 w-4 mt-1 text-yellow-500" />

                    <div className="flex-1 text-sm/7">
                      No attestation available for this control. This control
                      expects a{" "}
                      <CopyCodeFragment
                        codeString={props.policyDetails.predicateType}
                      ></CopyCodeFragment>{" "}
                      predicate type. Use the following command to create such
                      an attestation and upload it to the container-registry as
                      well as to DevGuard{" "}
                      <CopyCodeFragment
                        codeString={`devguard-scanner attest --token ${pat.pat ? pat.pat.privKey : "<Personal access token>"} --predicateType "${props.policyDetails.predicateType}" <json file>`}
                      ></CopyCodeFragment>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-16"></div>
            </div>
            <div className="col-span-1 border-l">
              <Card className="bg-transparent border-none">
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                  <CardDescription>
                    Evaluation result after comparing the policy with the
                    current state of the asset
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-row">
                    {props.policyDetails.compliant === null ? (
                      <ColoredBadge variant="high">
                        <TriangleAlert className="h-4 w-4 mr-1" />
                        Could not evaluate control
                      </ColoredBadge>
                    ) : (
                      <ColoredBadge
                        variant={violationLengthToLevel(
                          props.policyDetails.violations?.length ?? 0,
                        )}
                      >
                        {props.policyDetails.violations?.length ?? 0} Violations
                      </ColoredBadge>
                    )}
                  </div>
                  <hr className="mt-4" />
                  <div className="flex-1 text-sm mt-4">
                    <span className="text-muted-foreground">
                      Update the attestation using the following command
                    </span>
                    <div className="mt-2">
                      <CopyCodeFragment
                        codeString={`devguard-scanner attest --token ${pat.pat ? pat.pat.privKey : "<Personal access token>"} --predicateType "${props.policyDetails.predicateType}" <json file>`}
                      ></CopyCodeFragment>
                    </div>
                    <div className="mt-10">
                      <PatSection
                        description="Personal access token to create attestations"
                        {...pat}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext) => {
    // fetch the project
    const {
      organizationSlug,
      projectSlug,
      assetSlug,
      assetVersionSlug,
      control,
    } = context.params!;

    const apiClient = getApiClientFromContext(context);
    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/refs/" +
      assetVersionSlug +
      "/compliance/" +
      control;

    const [resp]: [PolicyEvaluation] = await Promise.all([
      apiClient(uri).then((r) => r.json()),
    ]);

    return {
      props: {
        policyDetails: resp,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    asset: withAsset,
    project: withProject,
    contentTree: withContentTree,
    assetVersion: withAssetVersion,
  },
);

export default Index;
