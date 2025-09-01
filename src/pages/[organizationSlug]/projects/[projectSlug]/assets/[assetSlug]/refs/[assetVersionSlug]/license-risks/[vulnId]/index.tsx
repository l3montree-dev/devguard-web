import Page from "@/components/Page";

import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";

import { DetailedLicenseRiskDTO, VulnEventDTO } from "@/types/api/api";

import RiskAssessmentFeed from "@/components/risk-assessment/RiskAssessmentFeed";
import { AsyncButton } from "@/components/ui/button";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import Link from "next/link";
import { FunctionComponent, useEffect, useState } from "react";

import AssetTitle from "@/components/common/AssetTitle";
import { Combobox } from "@/components/common/Combobox";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { withAssetVersion } from "@/decorators/withAssetVersion";
import { withContentTree } from "@/decorators/withContentTree";
import { withOrganization } from "@/decorators/withOrganization";
import {
  browserApiClient,
  getApiClientFromContext,
} from "@/services/devGuardApi";
import { beautifyPurl, extractVersion, licenses } from "@/utils/common";
import {
  emptyThenNull,
  getIntegrationNameFromRepositoryIdOrExternalProviderId,
} from "@/utils/view";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import VulnState from "../../../../../../../../../../components/common/VulnState";
import GitProviderIcon from "../../../../../../../../../../components/GitProviderIcon";
import { useActiveAssetVersion } from "../../../../../../../../../../hooks/useActiveAssetVersion";

import EcosystemImage from "../../../../../../../../../../components/common/EcosystemImage";
import Callout from "../../../../../../../../../../components/common/Callout";
import ArtifactBadge from "@/components/ArtifactBadge";

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
    license?: string;
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
        `/organizations/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/refs/${assetVersion?.slug}/license-risks/${vuln.id}/mitigate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );
      json = await resp.json();
    } else if (data.status === "licenseDecision") {
      const resp = await browserApiClient(
        `/organizations/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/refs/${assetVersion?.slug}/license-risks/${vuln.id}/final-license-decision`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
          vuln.id,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
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

  const isOpen = vuln.state === "open";

  const [updatedLicense, setUpdatedLicense] = useState<string>(
    vuln.component.license ?? "unknown",
  );

  return (
    <Page Menu={assetMenu} Title={<AssetTitle />} title="License Details">
      <div className="flex flex-row gap-4">
        <div className="flex-1">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <h1 className="text-2xl font-semibold">License Details</h1>

              <div className="mt-4 flex flex-row flex-wrap gap-2 text-sm">
                {vuln.ticketUrl && (
                  <Link href={vuln.ticketUrl} target="_blank">
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
                      <span>{vuln.ticketUrl}</span>
                    </Badge>
                  </Link>
                )}

                <VulnState state={vuln.state as any} />

                {vuln.artifacts.map((artifact) => (
                  <ArtifactBadge
                    key={artifact.artifactName + vuln.id}
                    artifactName={artifact.artifactName}
                  ></ArtifactBadge>
                ))}
              </div>

              <div className="text-sm mt-6 text-muted-foreground">
                The license for this component is unknown and may pose a
                compliance risk. Please review the license (e.g., by checking
                the component’s GitHub project) to understand its terms and
                implications for your project.
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
              {vuln.finalLicenseDecision && (
                <div className="mt-4">
                  <Callout intent="info">
                    <span className="text-sm font-semibold">
                      License Decision:{" "}
                    </span>
                    <span className="text-sm">{vuln.finalLicenseDecision}</span>
                  </Callout>
                </div>
              )}
              <div className="mt-16">
                <RiskAssessmentFeed
                  vulnerabilityName={
                    emptyThenNull(vuln.componentPurl) ?? "Unknown"
                  }
                  events={vuln.events}
                />
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {vuln.state !== "open"
                        ? "Reopen this vulnerability"
                        : "Add a comment"}
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
                          <div className="flex flex-wrap justify-end flex-row items-center gap-2">
                            {!vuln.ticketId &&
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
                                      license: updatedLicense,
                                    })
                                  }
                                >
                                  <div className="flex flex-col">
                                    <div className="flex">
                                      <div className="mr-2">
                                        <GitProviderIcon
                                          externalEntityProviderIdOrRepositoryId={
                                            asset.externalEntityProviderId ??
                                            "gitlab"
                                          }
                                        />
                                      </div>
                                      Create Ticket
                                    </div>
                                  </div>
                                </AsyncButton>
                              )}

                            {!vuln.ticketId &&
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
                                      license: updatedLicense,
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

                            {!vuln.ticketId &&
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
                                      license: updatedLicense,
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
                                  license: updatedLicense,
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
                                  license: updatedLicense,
                                })
                              }
                              variant={"secondary"}
                            >
                              Comment
                            </AsyncButton>
                          </div>
                        </div>
                        <hr />
                        <div className="flex justify-end flex-row items-center gap-2 border-muted rounded-md">
                          <div>
                            <Combobox
                              onSelect={setUpdatedLicense}
                              items={licenses}
                              placeholder={updatedLicense}
                              emptyMessage={"No results"}
                            />
                          </div>
                          <AsyncButton
                            onClick={() =>
                              handleSubmit({
                                status: "licenseDecision",
                                justification,
                                license: updatedLicense,
                              })
                            }
                            disabled={updatedLicense === vuln.component.license}
                            variant="default"
                          >
                            Make final license decision
                          </AsyncButton>
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
                                license: updatedLicense,
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
                    {vuln.ticketUrl && (
                      <small className="mt-2 block w-full text-right text-muted-foreground">
                        Comment will be synced with{" "}
                        <Link href={vuln.ticketUrl} target="_blank">
                          {vuln.ticketUrl}
                        </Link>
                      </small>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="col-span-1">
              <div className="p-5">
                <h3 className="mb-2 text-sm font-semibold">Package Details</h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="rounded-lg border bg-card p-4">
                      <p className="text-sm">
                        <span className="flex flex-row gap-2">
                          <EcosystemImage packageName={vuln.componentPurl} />{" "}
                          <span className="flex-1">
                            {beautifyPurl(vuln.componentPurl)}
                          </span>
                        </span>
                      </p>
                      <div className="mt-4 text-sm">
                        <div className="mt-1 flex flex-row justify-between">
                          <span className="text-xs text-muted-foreground">
                            Installed version:{" "}
                          </span>
                          <Badge variant={"outline"}>
                            {extractVersion(vuln.componentPurl) ?? "unknown"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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

    const {
      organizationSlug,
      projectSlug,
      assetSlug,
      assetVersionSlug,
      vulnId,
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
      "/license-risks/" +
      vulnId;

    const [resp]: [DetailedLicenseRiskDTO] = await Promise.all([
      apiClient(uri).then((r) => r.json()),
    ]);

    return {
      props: {
        vuln: resp,
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
