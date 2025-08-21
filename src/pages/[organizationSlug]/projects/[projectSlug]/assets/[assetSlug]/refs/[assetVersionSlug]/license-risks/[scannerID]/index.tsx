import Page from "@/components/Page";

import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";

import {
  DetailedLicenseRiskDTO,
  LicenseRiskDTO,
  VulnEventDTO,
} from "@/types/api/api";

import Image from "next/image";
import RiskAssessmentFeed from "@/components/risk-assessment/RiskAssessmentFeed";
import { AsyncButton } from "@/components/ui/button";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { FunctionComponent, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { withOrganization } from "@/decorators/withOrganization";
import AssetTitle from "@/components/common/AssetTitle";
import { withAssetVersion } from "@/decorators/withAssetVersion";
import { withContentTree } from "@/decorators/withContentTree";
import {
  emptyThenNull,
  getIntegrationNameFromRepositoryIdOrExternalProviderId,
} from "@/utils/view";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import VulnState from "../../../../../../../../../../components/common/VulnState";
import { useActiveAssetVersion } from "../../../../../../../../../../hooks/useActiveAssetVersion";
import GitProviderIcon from "../../../../../../../../../../components/GitProviderIcon";
import { Combobox } from "@/components/common/Combobox";
import { licenses } from "@/utils/common";
import { Check, ListRestart, Loader2, OctagonAlert } from "lucide-react";
import {
  browserApiClient,
  getApiClientFromContext,
} from "@/services/devGuardApi";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";

const MarkdownEditor = dynamic(
  () => import("@/components/common/MarkdownEditor"),
  {
    ssr: false,
  },
);

interface Props {
  vuln: DetailedLicenseRiskDTO;
}

const Index: FunctionComponent<Props> = (props) => {
  const [vuln, setVuln] = useState<DetailedLicenseRiskDTO>(props.vuln);
  useEffect(() => {
    setVuln(props.vuln);
  }, [props.vuln]);

  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const assetMenu = useAssetMenu();
  const asset = useActiveAsset()!;
  const assetVersion = useActiveAssetVersion();

  const [justification, setJustification] = useState<string | undefined>(
    undefined,
  );

  const handleSubmit = async (data: {
    status?: VulnEventDTO["type"];
    justification?: string;
    mechanicalJustification?: string;
    mitigatedLicense?: string;
  }) => {
    if (data.status === undefined) {
      return;
    }

    if (!Boolean(data.justification)) {
      return toast("Please provide a justification", {
        description: "You need to provide a justification for your decision.",
      });
    }

    let json: DetailedLicenseRiskDTO;

    if (data.status === "mitigate") {
      const resp = await browserApiClient(
        `/organizations/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/refs/${assetVersion?.slug}/license-risks/${vuln.licenseRisk.id}/mitigate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );
      json = await resp.json();
    } else {
      const resp = await browserApiClient(
        "/organizations/" +
          activeOrg.slug +
          "/projects/" +
          project.slug +
          "/assets/" +
          asset.slug +
          "/refs/" +
          assetVersion?.slug +
          "/license-risks/" +
          vuln.licenseRisk.id,

        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: data.status,
            justification: data.justification,
            mechanicalJustification: data.mechanicalJustification,
            mitigatedLicense: data.mitigatedLicense,
          }),
        },
      );
      json = await resp.json();
    }

    if (!json?.events) {
      return toast("Failed to update license risk", {
        description: "Please try again later.",
      });
    }

    setVuln((prev) => ({
      ...prev,
      ...json,
      events: prev.events.concat([
        {
          ...json.events.slice(-1)[0],
        },
      ]),
    }));
    setJustification("");
  };

  const isOpen =
    (vuln.licenseRisk.finalLicenseDecision ?? "open").toLowerCase() === "open";

  const [updatedLicense, setUpdatedLicense] = useState<string>(
    vuln.licenseRisk.licenseName,
  );

  // const handleLicenseSelect = async (value: string) => {
  //   setIsUpdatingLicense(true);
  //   const req = await browserApiClient(
  //     `/organizations/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/refs/${assetVersion?.slug}/license-risks/${vuln.licenseRisk.id}/final-license-decision`,
  //     {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ license: value }),
  //     },
  //   );
  //   if (!req.ok) {
  //     toast("License did not updated");
  //   } else {
  //     toast("License updated");
  //   }
  // };

  return (
    <Page Menu={assetMenu} Title={<AssetTitle />} title="License Details">
      <div className="flex flex-row gap-4">
        <div className="flex-1">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <h1 className="text-2xl font-semibold">License Details</h1>

              <div className="mt-4 flex flex-row flex-wrap gap-2 text-sm">
                {vuln.licenseRisk.ticketUrl && (
                  <Link href={vuln.licenseRisk.ticketUrl} target="_blank">
                    <Badge className="h-full" variant={"secondary"}>
                      <div className="mr-2">
                        <GitProviderIcon
                          externalEntityProviderIdOrRepositoryId={
                            asset.externalEntityProviderId ??
                            asset.repositoryId ??
                            "gitlab"
                          }
                        />
                      </div>
                      <span>{vuln.licenseRisk.ticketUrl}</span>
                    </Badge>
                  </Link>
                )}

                <VulnState state={"open"} />

                <div className="flex flex-row gap-2">
                  {vuln.licenseRisk.scannerIds.split(" ").map((s) => (
                    <Badge key={s} variant={"secondary"}>
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <Card className="mt-4">
                <CardHeader>
                  <div className="flex flex-row items-center">
                    <CardTitle>Mitigate your License</CardTitle>
                    <ListRestart className="ml-2" />
                  </div>
                </CardHeader>
                <div className="m-4">
                  <Combobox
                    onSelect={setUpdatedLicense}
                    items={licenses}
                    placeholder={updatedLicense}
                    emptyMessage={"No results"}
                  />
                </div>
              </Card>

              <div className="mt-16">
                <RiskAssessmentFeed
                  vulnerabilityName={
                    emptyThenNull(vuln.licenseRisk.componentPurl) ??
                    emptyThenNull(vuln.licenseRisk.assetVersionName) ??
                    ""
                  }
                  events={vuln.events}
                />
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {vuln.licenseRisk.finalLicenseDecision === "open"
                        ? "Add a comment"
                        : "Reopen this vulnerability"}
                    </CardTitle>
                    <CardDescription></CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isOpen ? (
                      <form
                        className="flex flex-col gap-4"
                        onSubmit={(e) => e.preventDefault()}
                      >
                        <div>
                          <label className="mb-2 block text-sm font-semibold">
                            Comment
                          </label>
                          <MarkdownEditor
                            placeholder="Add your comment here..."
                            value={justification ?? ""}
                            setValue={setJustification}
                          />
                        </div>

                        <div className="flex flex-row justify-end gap-1">
                          <div className="flex flex-row items-start gap-2">
                            {!vuln.licenseRisk.ticketId &&
                              getIntegrationNameFromRepositoryIdOrExternalProviderId(
                                asset,
                                project,
                              ) === "gitlab" && (
                                <AsyncButton
                                  variant={"secondary"}
                                  onClick={() =>
                                    handleSubmit({
                                      status: "mitigate",
                                      justification,
                                      mitigatedLicense: updatedLicense,
                                    })
                                  }
                                >
                                  <div className="flex flex-col">
                                    <div className="flex">
                                      <GitProviderIcon
                                        externalEntityProviderIdOrRepositoryId={
                                          asset.externalEntityProviderId ??
                                          "gitlab"
                                        }
                                      />
                                      Create Ticket
                                    </div>
                                  </div>
                                </AsyncButton>
                              )}

                            {!vuln.licenseRisk.ticketId &&
                              getIntegrationNameFromRepositoryIdOrExternalProviderId(
                                asset,
                                project,
                              ) === "github" && (
                                <AsyncButton
                                  variant={"secondary"}
                                  onClick={() =>
                                    handleSubmit({
                                      status: "mitigate",
                                      justification,
                                      mitigatedLicense: updatedLicense,
                                    })
                                  }
                                >
                                  <div className="flex flex-col">
                                    <div className="flex">
                                      <Image
                                        alt="GitLab Logo"
                                        width={15}
                                        height={15}
                                        className="mr-2 dark:invert"
                                        src={"/assets/github.svg"}
                                      />
                                      Create GitHub Ticket
                                    </div>
                                  </div>
                                </AsyncButton>
                              )}

                            {!vuln.licenseRisk.ticketId &&
                              getIntegrationNameFromRepositoryIdOrExternalProviderId(
                                asset,
                                project,
                              ) === "jira" && (
                                <AsyncButton
                                  variant={"secondary"}
                                  onClick={() =>
                                    handleSubmit({
                                      status: "mitigate",
                                      justification,
                                      mitigatedLicense: updatedLicense,
                                    })
                                  }
                                >
                                  <div className="flex flex-col">
                                    <div className="flex">
                                      <Image
                                        alt="Jira Logo"
                                        width={15}
                                        height={15}
                                        className="mr-2"
                                        src={"/assets/jira-svgrepo-com.svg"}
                                      />
                                      Create Jira Ticket
                                    </div>
                                  </div>
                                </AsyncButton>
                              )}

                            <AsyncButton
                              onClick={() =>
                                handleSubmit({
                                  status: "accepted",
                                  justification,
                                  mitigatedLicense: updatedLicense,
                                })
                              }
                              variant={"secondary"}
                            >
                              Accept risk
                            </AsyncButton>
                            <AsyncButton
                              // disabled={isUpdatingLicense === false}
                              // onMouseOver={() => toast("burr")}
                              onClick={() =>
                                handleSubmit({
                                  status: "comment",
                                  justification,
                                  mitigatedLicense: updatedLicense,
                                })
                              }
                              variant={"default"}
                            >
                              Comment
                            </AsyncButton>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <form
                        className="flex flex-col gap-4"
                        onSubmit={(e) => e.preventDefault()}
                      >
                        <div>
                          <label className="mb-2 block text-sm font-semibold">
                            Comment
                          </label>
                          <MarkdownEditor
                            value={justification ?? ""}
                            setValue={setJustification}
                            placeholder="Add your comment here..."
                          />
                        </div>

                        <p className="text-sm text-muted-foreground">
                          You can reopen this license risk if you plan to
                          mitigate it now, or accepted it by accident.
                        </p>
                        <div className="flex flex-row justify-end">
                          <AsyncButton
                            onClick={() =>
                              handleSubmit({
                                status: "reopened",
                                justification,
                                mitigatedLicense: updatedLicense,
                              })
                            }
                            variant={"secondary"}
                            type="submit"
                          >
                            Reopen
                          </AsyncButton>
                        </div>
                      </form>
                    )}
                    {vuln.licenseRisk.ticketUrl && (
                      <small className="mt-2 block w-full text-right text-muted-foreground">
                        Comment will be synced with{" "}
                        <Link href={vuln.licenseRisk.ticketUrl} target="_blank">
                          {vuln.licenseRisk.ticketUrl}
                        </Link>
                      </small>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="col-span-1">
              <h3 className="mb-2 text-lg font-semibold">Package Details</h3>
              <div className="text-sm text-muted-foreground">
                {`Package: ${vuln.licenseRisk.componentPurl}`}
                <br />
                <div className="flex flex-row items-center">
                  {`License: ${updatedLicense ?? "unknown"}`}

                  <Tooltip>
                    <TooltipTrigger>
                      <div>
                        {updatedLicense === vuln.licenseRisk.licenseName ? (
                          <OctagonAlert className="text-primary w-4 ml-2" />
                        ) : updatedLicense !== vuln.licenseRisk.licenseName ? (
                          <Loader2 className="size-4 animate-spin ml-2" />
                        ) : (
                          <Check className="size-4 text-green-500" />
                        )}
                      </div>

                      {/* <OctagonAlert className="text-primary w-4 ml-2" /> */}
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Make sure to check this license, it could be a risk
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <h3 className="mb-2 mt-4 text-lg font-semibold">Explanation</h3>
              <div className="text-sm text-muted-foreground">
                Your License is unknown and might create a compliance risk,
                please review this license to avoid any license violations.
              </div>
              <div className="flex flex-row items-center mt-2">
                <Image
                  alt="OSI Logo"
                  src="/assets/osi-keyhole.svg"
                  width={24}
                  height={24}
                  className="mr-2"
                ></Image>
                <a
                  href="https://opensource.org/licenses/"
                  target="_blank"
                  className="text-sm font-semibold !text-muted-foreground underline"
                >
                  Open Source Licenses
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default Index;

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext, { assetVersion }) => {
    // fetch the project
    console.log("here is the response: ");
    const {
      organizationSlug,
      projectSlug,
      assetSlug,
      assetVersionSlug,
      scannerID,
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
      "/first-party-vulns/" +
      scannerID;

    const [resp]: [LicenseRiskDTO] = await Promise.all([
      apiClient(uri).then((r) => r.json()),
    ]);

    const licenseRiskApiMocks: LicenseRiskDTO = {
      id: "lr-1",
      assetId: "asset-frontend-42",
      assetVersionName: "web-frontend@1.4.3",
      componentPurl: "pkg:npm/lodash@4.17.21",
      licenseName: "unknown",
      scannerIds: "scanner-ossindex,scanner-snyk",
      finalLicenseDecision: "open",
      createdAt: "2025-08-16T10:15:00Z",
      manualTicketCreation: false,
      type: "licenseRisk",
      userId: "",
      vulnId: "",
      vulnType: "dependencyVuln",
      justification: "",
      mechanicalJustification: "",
      vulnerabilityName: null,
      arbitraryJSONData: { scannerIds: "bal" },
      packageName: null,
      uri: null,
    };

    const detail: DetailedLicenseRiskDTO = {
      licenseRisk: licenseRiskApiMocks,
      events: [],
    };

    return {
      props: {
        vuln: detail,
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
