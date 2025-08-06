import Page from "@/components/Page";

import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import {
  browserApiClient,
  getApiClientFromContext,
} from "@/services/devGuardApi";
import {
  DetailedDependencyVulnDTO,
  DetailedFirstPartyVulnDTO,
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
import Markdown from "react-markdown";

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
import CopyCode from "../../../../../../../../../../components/common/CopyCode";
import VulnState from "../../../../../../../../../../components/common/VulnState";
import { useActiveAssetVersion } from "../../../../../../../../../../hooks/useActiveAssetVersion";
import GitProviderIcon from "../../../../../../../../../../components/GitProviderIcon";

const MarkdownEditor = dynamic(
  () => import("@/components/common/MarkdownEditor"),
  {
    ssr: false,
  },
);

interface Props {
  vuln: DetailedFirstPartyVulnDTO;
}

const highlightRegex = new RegExp(/\+\+\+(.+)\+\+\+/, "gms");

const Index: FunctionComponent<Props> = (props) => {
  const [vuln, setVuln] = useState<DetailedFirstPartyVulnDTO>(props.vuln);
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
  }) => {
    if (data.status === undefined) {
      return;
    }

    if (!Boolean(data.justification)) {
      return toast("Please provide a justification", {
        description: "You need to provide a justification for your decision.",
      });
    }

    let json: any;
    if (data.status === "mitigate") {
      const resp = await browserApiClient(
        "/organizations/" +
          activeOrg.slug +
          "/projects/" +
          project.slug +
          "/assets/" +
          asset.slug +
          "/refs/" +
          assetVersion?.slug +
          "/first-party-vulns/" +
          vuln.id +
          "/mitigate",
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
          "/first-party-vulns/" +
          vuln.id,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );
      json = await resp.json();
    }

    if (!json.events) {
      return toast("Failed to update vulnerability", {
        description: "Please try again later.",
      });
    }

    setVuln((prev) => ({
      ...prev,
      ...json,
      events: prev.events.concat([
        {
          ...json.events.slice(-1)[0],
          assetVersionName: assetVersion?.name,
        },
      ]),
    }));
    setJustification("");
  };

  return (
    <Page
      Menu={assetMenu}
      Title={<AssetTitle />}
      title={vuln.ruleId ?? "Vuln Details"}
    >
      <div className="flex flex-row gap-4">
        <div className="flex-1">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <h1 className="text-2xl font-semibold">
                {emptyThenNull(vuln.ruleName) ??
                  emptyThenNull(vuln.ruleId) ??
                  "Vuln Details"}
              </h1>
              <div className="mt-4 text-muted-foreground">
                <Markdown>{vuln.message?.replaceAll("\n", "\n\n")}</Markdown>
              </div>
              <div className="mt-4 flex flex-row flex-wrap gap-2 text-sm">
                {vuln.ticketUrl && (
                  <Link href={vuln.ticketUrl} target="_blank">
                    <Badge className="h-full" variant={"secondary"}>
                      {vuln.ticketId?.startsWith("github:") ? (
                        <Image
                          src="/assets/github.svg"
                          alt="GitHub Logo"
                          className="-ml-1 mr-2 dark:invert"
                          width={15}
                          height={15}
                        />
                      ) : (
                        <div className="mr-2">
                          <GitProviderIcon
                            externalEntityProviderIdOrRepositoryId={
                              asset.externalEntityProviderId ??
                              asset.repositoryId ??
                              "gitlab"
                            }
                          />
                        </div>
                      )}
                      <span>{vuln.ticketUrl}</span>
                    </Badge>
                  </Link>
                )}
                <VulnState state={vuln.state} />

                <div className="flex flex-row gap-2">
                  {vuln.scannerIds.split(" ").map((s) => (
                    <Badge key={s} variant={"secondary"}>
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="mt-4 rounded-lg border bg-secondary">
                {vuln.snippetContents.map((snippet, idx) => (
                  <div key={idx}>
                    {idx === 0 && (
                      <div className="font-mono px-4 py-2 text-sm font-medium">
                        {vuln.uri}
                      </div>
                    )}
                    <CopyCode
                      highlightRegexPattern={highlightRegex}
                      codeString={snippet.snippet}
                      startingLineNumber={snippet.startLine}
                    />
                    {idx < vuln.snippetContents.length - 1 && (
                      <div className="flex flex-row opacity-75 justify-center items-center w-full">
                        ···
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-16">
                <RiskAssessmentFeed
                  vulnerabilityName={
                    emptyThenNull(vuln.ruleName) ??
                    emptyThenNull(vuln.ruleId) ??
                    ""
                  }
                  events={vuln.events}
                />
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {vuln.state === "open"
                        ? "Add a comment"
                        : "Reopen this vulnerability"}
                    </CardTitle>
                    <CardDescription></CardDescription>
                  </CardHeader>
                  <CardContent>
                    {vuln.state === "open" ? (
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
                            {vuln.ticketId === null &&
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

                            {vuln.ticketId === null &&
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

                            {vuln.ticketId === null &&
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
                                })
                              }
                              variant={"secondary"}
                            >
                              Accept risk
                            </AsyncButton>
                            <AsyncButton
                              onClick={() =>
                                handleSubmit({
                                  status: "falsePositive",
                                  justification,
                                })
                              }
                              variant={"secondary"}
                            >
                              False Positive
                            </AsyncButton>
                            <AsyncButton
                              onClick={() =>
                                handleSubmit({
                                  status: "comment",
                                  justification,
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
                        onSubmit={(e) => {
                          e.preventDefault();
                        }}
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
                          You can reopen this vuln, if you plan to mitigate the
                          risk now, or accepted this vuln by accident.
                        </p>
                        <div className="flex flex-row justify-end">
                          <AsyncButton
                            onClick={() =>
                              handleSubmit({
                                status: "reopened",
                                justification,
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
              <h3 className="mb-2 text-lg font-semibold">Rule Details</h3>
              <div className="text-sm text-muted-foreground">
                <Markdown>{vuln.ruleDescription}</Markdown>
                {vuln.ruleHelpUri && (
                  <Link
                    href={vuln.ruleHelpUri}
                    target="_blank"
                    className="mt-2 inline-block text-sm text-muted-foreground"
                  >
                    {vuln.ruleHelpUri}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

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
      "/first-party-vulns/" +
      vulnId;

    const [resp]: [DetailedDependencyVulnDTO] = await Promise.all([
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

export default Index;
