"use client";

import Page from "@/components/Page";

import { PolicyEvaluation } from "@/types/api/api";

import { useAssetMenu } from "@/hooks/useAssetMenu";
import { FunctionComponent } from "react";
import Markdown from "react-markdown";

import AssetTitle from "@/components/common/AssetTitle";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { TriangleAlert, XIcon } from "lucide-react";
import usePersonalAccessToken from "@/hooks/usePersonalAccessToken";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import CopyCode, { CopyCodeFragment } from "@/components/common/CopyCode";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ColoredBadge from "@/components/common/ColoredBadge";
import PatSection from "@/components/PatSection";
import useSWR from "swr";
import { fetcher } from "@/hooks/useApi";
import useDecodedParams from "@/hooks/useDecodedParams";
import { Skeleton } from "@/components/ui/skeleton";
import Err from "../../../../../../../../../../components/common/Err";

// Import the violationLengthToLevel function
const violationLengthToLevel = (violationCount: number) => {
  if (violationCount === 0) return "low";
  if (violationCount <= 2) return "medium";
  return "high";
};

const Index = () => {
  const params = useDecodedParams();
  const {
    organizationSlug,
    projectSlug,
    assetSlug,
    assetVersionSlug,
    control,
  } = params;

  // Fetch policy details using SWR
  const {
    data: policyDetails,
    error,
    isLoading,
  } = useSWR<PolicyEvaluation>(
    organizationSlug && projectSlug && assetSlug && assetVersionSlug && control
      ? `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/compliance/${control}`
      : null,
    fetcher,
  );

  const assetMenu = useAssetMenu();
  const pat = usePersonalAccessToken();

  // Show loading skeleton if data is loading
  if (isLoading || !policyDetails) {
    return (
      <Page title="Loading Compliance Control...">
        <div className="flex flex-row gap-4">
          <div className="flex-1">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3">
                <Skeleton className="w-full h-8 mb-4" />
                <Skeleton className="w-full h-32 mb-4" />
                <Skeleton className="w-full h-20 mb-4" />
              </div>
              <div className="col-span-1 border-l pl-4">
                <Skeleton className="w-full h-64" />
              </div>
            </div>
          </div>
        </div>
      </Page>
    );
  }

  // Show error state
  if (error) {
    return (
      <Page
        Menu={assetMenu}
        Title={<AssetTitle />}
        title="Error Loading Compliance Control"
      >
        <Err />
      </Page>
    );
  }
  return (
    <Page Menu={assetMenu} Title={<AssetTitle />} title={policyDetails.title}>
      <div className="flex flex-row gap-4">
        <div className="flex-1">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <h1 className="text-2xl font-semibold">{policyDetails.title}</h1>
              <div className="mt-4 text-muted-foreground">
                <Markdown>
                  {policyDetails.description.replaceAll("\n", "\n\n")}
                </Markdown>
              </div>

              <div>
                <Collapsible className="bg-secondary border rounded-lg mt-4">
                  <CollapsibleTrigger className="w-full flex justify-between items-center text-left font-semibold rounded-lg px-2 py-1 ">
                    <span>Expand policy as code</span>
                    <ChevronDownIcon className="h-4 w-4 ml-2 inline-block" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CopyCode language="rego" codeString={policyDetails.rego} />
                  </CollapsibleContent>
                </Collapsible>
              </div>
              {policyDetails.compliant === false ? (
                <div className="text-sm">
                  <h2 className="mt-8 text-lg font-semibold">
                    Control evaluation result
                  </h2>
                  <div className="flex flex-col gap-2 mt-4">
                    {policyDetails.violations?.map((violation) => (
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
              ) : policyDetails.compliant === true ? (
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
                    <TriangleAlert className="h-4 w-4 mt-2 text-yellow-500" />

                    <div className="flex-1 text-sm/7">
                      No attestation available for this control. This control
                      expects a{" "}
                      <CopyCodeFragment
                        codeString={policyDetails.predicateType}
                      ></CopyCodeFragment>{" "}
                      predicate type. Use the following command to create such
                      an attestation and upload it to the container-registry as
                      well as to DevGuard{" "}
                      <CopyCodeFragment
                        codeString={`devguard-scanner attest --token ${pat.pat ? pat.pat.privKey : "<Personal access token>"} --predicateType "${policyDetails.predicateType}" <json file>`}
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
                    {policyDetails.compliant === null ? (
                      <ColoredBadge variant="high">
                        <TriangleAlert className="h-4 w-4 mr-1" />
                        Could not evaluate control
                      </ColoredBadge>
                    ) : (
                      <ColoredBadge
                        variant={violationLengthToLevel(
                          policyDetails.violations?.length ?? 0,
                        )}
                      >
                        {policyDetails.violations?.length ?? 0} Violations
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
                        codeString={`devguard-scanner attest --token ${pat.pat ? pat.pat.privKey : "<Personal access token>"} --predicateType "${policyDetails.predicateType}" <json file>`}
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

export default Index;
