"use client";

import Page from "@/components/Page";
import AssetTitle from "@/components/common/AssetTitle";
import CopyCode from "@/components/common/CopyCode";
import Severity from "@/components/common/Severity";
import VulnState from "@/components/common/VulnState";
import FormatDate from "@/components/risk-assessment/FormatDate";
import RiskAssessmentFeed from "@/components/risk-assessment/RiskAssessmentFeed";
import { Badge } from "@/components/ui/badge";
import { AsyncButton, Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { useDeleteEvent } from "@/hooks/useDeleteEvent";
import { browserApiClient } from "@/services/devGuardApi";
import { useCreateVexRule } from "@/hooks/useCreateVexRule";
import {
  AssetDTO,
  DependencyVulnHints,
  DetailedDependencyVulnDTO,
  RequirementsLevel,
  VulnEventDTO,
} from "@/types/api/api";
import { beautifyPurl, getEcosystem } from "@/utils/common";
import { getIntegrationNameFromRepositoryIdOrExternalProviderId } from "@/utils/view";
import {
  BugAntIcon,
  InformationCircleIcon,
  ShareIcon,
  SpeakerXMarkIcon,
  StopIcon,
} from "@heroicons/react/24/outline";

import { CaretDownIcon } from "@radix-ui/react-icons";
import { CheckCircleIcon } from "lucide-react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FunctionComponent, ReactNode, useMemo, useState } from "react";
import { Label, Pie, PieChart } from "recharts";
import { toast } from "sonner";
import useSWR from "swr";
import AcceptRiskDialog from "../../../../../../../../../../../components/AcceptRiskDialog";
import AffectedComponentDetails from "../../../../../../../../../../../components/AffectedComponent";
import ArtifactBadge from "../../../../../../../../../../../components/ArtifactBadge";
import CommentDialog from "../../../../../../../../../../../components/CommentDialog";
import DependencyGraph from "../../../../../../../../../../../components/DependencyGraph";
import FalsePositiveDialog from "../../../../../../../../../../../components/FalsePositiveDialog";
import GitProviderIcon from "../../../../../../../../../../../components/GitProviderIcon";
import Callout from "../../../../../../../../../../../components/common/Callout";
import Err from "../../../../../../../../../../../components/common/Err";
import Markdown from "../../../../../../../../../../../components/common/Markdown";
import EditorSkeleton from "../../../../../../../../../../../components/risk-assessment/EditorSkeleton";
import RiskAssessmentFeedSkeleton from "../../../../../../../../../../../components/risk-assessment/RiskAssessmentFeedSkeleton";
import { Skeleton } from "../../../../../../../../../../../components/ui/skeleton";
import { fetcher } from "../../../../../../../../../../../data-fetcher/fetcher";
import { useActiveAssetVersion } from "../../../../../../../../../../../hooks/useActiveAssetVersion";
import useDecodedParams from "../../../../../../../../../../../hooks/useDecodedParams";
import {
  convertPathsToTree,
  ViewDependencyTreeNode,
} from "../../../../../../../../../../../utils/dependencyGraphHelpers";
import MitigateDialog from "@/components/MitigateDialog";

const MarkdownEditor = dynamic(
  () => import("@/components/common/MarkdownEditor"),
  {
    ssr: false,
  },
);

const parseCvssVector = (vector: string) => {
  const parts = vector.split("/");
  const [_version, ...rest] = parts;
  const res: { [key in string]: string } = {};

  for (const part of rest) {
    const [key, value] = part.split(":");
    res[key] = value;
  }
  return res;
};

const exploitMessage = (
  vuln: DetailedDependencyVulnDTO | undefined,
  obj: { [key: string]: string },
): {
  short: string;
  long: ReactNode;
} => {
  if (!vuln) {
    return {
      short: "",
      long: null,
    };
  }

  if (obj["E"] === "POC" || obj["E"] === "P") {
    return {
      short: "Proof of Concept",
      long: (
        <>
          A proof of concept is available for this vulnerability:
          <div>
            {vuln.cve?.exploits.map((exploit) => (
              <Link
                className="block"
                key={exploit.sourceURL}
                href={exploit.sourceURL}
              >
                {exploit.sourceURL}
              </Link>
            ))}
          </div>
        </>
      ),
    };
  } else if (obj["E"] === "F") {
    return {
      short: "Functional",
      long: (
        <>
          A functional exploit is available for this vulnerability
          <div>
            {vuln.cve?.exploits.map((exploit) => (
              <Link key={exploit.sourceURL} href={exploit.sourceURL}>
                {exploit.sourceURL}
              </Link>
            ))}
          </div>
        </>
      ),
    };
  } else if (obj["E"] === "A") {
    return {
      short: "Attacked",
      long: (
        <>
          This vulnerability is actively being exploited in the wild. Please
          take immediate action to mitigate the risk.
        </>
      ),
    };
  } else {
    return {
      short: "Not available",
      long: "We did not find any exploit available. Neither in GitHub repositories nor in the Exploit-Database. There are no script kiddies exploiting this vulnerability.",
    };
  }
};

const epssMessage = (epss: number) => {
  if (epss < 0.1) {
    return "The exploit probability is very low. The vulnerability is unlikely to be exploited in the next 30 days.";
  } else if (epss < 0.2) {
    return "The exploit probability is low. The vulnerability is unlikely to be exploited in the next 30 days.";
  } else if (epss < 0.4) {
    return "The exploit probability is moderate. The vulnerability is likely to be exploited in the next 30 days.";
  } else if (epss < 0.6) {
    return "The exploit probability is high. The vulnerability is very likely to be exploited in the next 30 days.";
  } else if (epss < 0.8) {
    return "The exploit probability is very high. The vulnerability is very likely to be exploited in the next 30 days.";
  } else {
    return "The exploit probability is critical. The vulnerability is very likely to be exploited in the next 30 days.";
  }
};

const componentDepthMessages = (depth: number) => {
  if (depth === 1) {
    return "The vulnerability is in a direct dependency of your project.";
  } else {
    return `The vulnerability is in a dependency of a dependency your project. It is ${depth} levels deep.`;
  }
};

const cvssBE = (
  asset: AssetDTO,
  cvssObj: {
    [key: string]: string;
  },
) => {
  let str = "";
  // check if the asset has some "high" requirements
  if (
    asset.availabilityRequirement === RequirementsLevel.High &&
    cvssObj["A"] === "H"
  ) {
    str +=
      "Exploiting this vulnerability is critical because the asset requires high availability, and the vulnerability significantly impacts availability.";
  } else if (cvssObj["A"] === "H") {
    str += "Exploiting this vulnerability significantly impacts availability.";
  }

  if (
    asset.integrityRequirement === RequirementsLevel.High &&
    cvssObj["I"] === "H"
  ) {
    str +=
      "Exploiting this vulnerability is critical because the asset requires high integrity, and the vulnerability significantly impacts integrity.";
  } else if (cvssObj["I"] === "H") {
    str += "Exploiting this vulnerability significantly impacts integrity.";
  }

  if (
    asset.confidentialityRequirement === RequirementsLevel.High &&
    cvssObj["C"] === "H"
  ) {
    str +=
      "Exploiting this vulnerability is critical because the asset requires high confidentiality, and the vulnerability significantly impacts confidentiality.";
  } else if (cvssObj["C"] === "H") {
    str +=
      "Exploiting this vulnerability significantly impacts confidentiality.";
  }
  return str;
};

const describeCVSS = (cvss: { [key: string]: string }) => {
  const baseScores = {
    AV: {
      N: "The vulnerability can be exploited over the network without needing physical access.",
      A: "The vulnerability can be exploited over a local network, such as Wi-Fi.",
      L: "The vulnerability requires local access to the device to be exploited.",
      P: "The vulnerability requires physical access to the device to be exploited.",
    },
    AC: {
      L: "It is easy for an attacker to exploit this vulnerability.",
      H: "It is difficult for an attacker to exploit this vulnerability and may require special conditions.",
    },
    PR: {
      N: "An attacker does not need any special privileges or access rights.",
      L: "An attacker needs basic access or low-level privileges.",
      H: "An attacker needs high-level or administrative privileges.",
    },
    UI: {
      N: "No user interaction is needed for the attacker to exploit this vulnerability.",
      R: "The attacker needs the user to perform some action, like clicking a link.",
    },
    S: {
      U: "The impact is confined to the system where the vulnerability exists.",
      C: "The vulnerability can affect other systems as well, not just the initial system.",
    },
    C: {
      H: "There is a high impact on the confidentiality of the information.",
      L: "There is a low impact on the confidentiality of the information.",
      N: "",
    },
    I: {
      H: "There is a high impact on the integrity of the data.",
      L: "There is a low impact on the integrity of the data.",
      N: "",
    },
    A: {
      H: "There is a high impact on the availability of the system.",
      L: "There is a low impact on the availability of the system.",
      N: "",
    },
  } as {
    [key in string]: {
      [key in string]: string;
    };
  };

  const order = ["AV", "AC", "PR", "UI", "S", "C", "I", "A"];
  return order
    .map((key) => {
      return baseScores[key][cvss[key]];
    })
    .filter(Boolean)
    .join("\n");
};

type MemoResult = {
  globalUpdate: string;
  ecosystemUpdate: string;
};

function Quickfix(props: { vuln: string; version?: string; package?: string }) {
  const { globalUpdate, ecosystemUpdate } = useMemo<MemoResult>(() => {
    switch (getEcosystem(props.vuln)) {
      case "npm": {
        return {
          globalUpdate: `npm audit fix`,
          ecosystemUpdate: `npm install ${props.package}@${props.version}`,
        };
      }
      case "golang": {
        return {
          globalUpdate: `go get -u ./...`,
          ecosystemUpdate: `go get ${props.package}@${props.version}`,
        };
      }
      case "pypi": {
        return {
          globalUpdate: `pip install pip-audit 
          pip-audit`,
          ecosystemUpdate: `pip install ${props.package}@${props.version}`,
        };
      }
      case "cargo": {
        return {
          globalUpdate: `cargo update`,
          ecosystemUpdate: `# in Cargo.toml: ${props.package}="${props.version}"`,
        };
      }
      case "nuget": {
        return {
          globalUpdate: `dotnet list package --vulnerable
          dotnet outdated`,
          ecosystemUpdate: `dotnet add package ${props.package} --version${props.version}`,
        };
      }
      case "apk": {
        return {
          globalUpdate: `apk update && apk upgrade`,
          ecosystemUpdate: `apk add ${props.package}=${props.version}`,
        };
      }
      // Ref: https://github.com/l3montree-dev/devguard/issues/1050
      /*case "deb": {
        return {
          globalUpdate: `apt update && apt upgrade`,
          ecosystemUpdate: `apt-get install -y ${props.package}=${props.version}`,
        };
      }*/
      default:
        return {
          globalUpdate: ``,
          ecosystemUpdate: ``,
        };
    }
  }, []);

  return globalUpdate === "" && ecosystemUpdate === "" ? null : (
    <div className="relative">
      <h3 className="mb-2 text-sm font-semibold">Quick Fix</h3>
      <div className="relative ">
        <div className="rounded-lg ">
          <div className=" rounded-lg border bg-card p-4 border">
            <div className="text-sm">
              <div className="mb-2">
                <span className="text-xs text-muted-foreground">
                  Update all Dependencies
                </span>

                <CopyCode codeString={globalUpdate}></CopyCode>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">
                  {`Update only ${props.package} `}
                </span>

                <CopyCode codeString={ecosystemUpdate}></CopyCode>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Index: FunctionComponent = () => {
  const pathname = usePathname();
  const { theme } = useTheme();

  const activeOrg = useActiveOrg();
  const project = useActiveProject()!;

  const assetMenu = useAssetMenu();
  const asset = useActiveAsset()!;
  const assetVersion = useActiveAssetVersion();

  const deleteEvent = useDeleteEvent();

  const [justification, setJustification] = useState<string | undefined>(
    undefined,
  );

  const [falsePositiveDialogOpen, setFalsePositiveDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [acceptRiskDialogOpen, setAcceptRiskDialogOpen] = useState(false);
  const [mitigateDialogOpen, setMitigateDialogOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  // fetch the project
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug, vulnId } =
    useDecodedParams();

  const uri =
    "/organizations/" +
    organizationSlug +
    "/projects/" +
    projectSlug +
    "/assets/" +
    assetSlug +
    "/refs/" +
    assetVersionSlug +
    "/dependency-vulns/" +
    vulnId;

  const {
    data: vuln,
    mutate,
    error,
  } = useSWR<DetailedDependencyVulnDTO>(uri, fetcher);

  // Handler to create false-positive rules from the dependency graph context menu
  const createFalsePositive = useCreateVexRule({
    activeOrgSlug: activeOrg.slug,
    projectSlug: project.slug,
    assetSlug: asset.slug,
    assetVersionSlug: assetVersion?.slug ?? "",
    cveId: vuln?.cveID ?? null,
    mutate: mutate ?? (() => Promise.resolve()),
  });

  const { data: graphResponse, isLoading: graphLoading } = useSWR<
    Array<Array<string>>
  >(
    vuln
      ? `/organizations/${activeOrg.slug}/projects/${project?.slug}/assets/${asset?.slug}/refs/${assetVersion?.slug}/path-to-component/?purl=${encodeURIComponent(vuln.componentPurl)}`
      : null,
    fetcher,
  );

  const graphData = useMemo<ViewDependencyTreeNode | null>(() => {
    if (!vuln || vuln.vulnerabilityPath.length === 0) {
      return null;
    }

    return convertPathsToTree([vuln.vulnerabilityPath], [vuln]);
  }, [vuln]);

  // Generate path pattern options for the user to select
  // Each option is a suffix of the vulnerability path with a count of matching paths
  const pathPatternOptions = useMemo(() => {
    // group the graphResponse by suffixes
    if (!graphResponse) return [];
    const suffixMap: { [key: string]: number } = {};
    graphResponse.forEach((path) => {
      for (let i = 1; i <= path.length; i++) {
        const suffix = path.slice(-i);
        const key = suffix.join(" > ");
        if (suffixMap[key]) {
          suffixMap[key] += 1;
        } else {
          suffixMap[key] = 1;
        }
      }
    });
    // create an array of suffixes
    // make sure to sort it

    const sortedSuffixes = Object.entries(suffixMap).sort(([x, a], [y, b]) => {
      return b - a;
    });

    return sortedSuffixes;
  }, [graphResponse]);

  const { data: hints } = useSWR<DependencyVulnHints>(uri + "/hints", fetcher);

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
    mutate();
  };

  const handleSubmit = async (data: {
    status?: VulnEventDTO["type"];
    justification?: string;
    mechanicalJustification?: string;
    pathPattern?: string[];
  }): Promise<boolean> => {
    if (data.status === undefined || !vuln) {
      return false;
    }

    if (!Boolean(data.justification) && !Boolean(data.pathPattern)) {
      toast("Please provide a justification", {
        description: "You need to provide a justification for your decision.",
      });
      return false;
    }

    // If the user selects a path suffix, we should create a False Positive Rule via the dedicated endpoint
    // instead of sending the pathPattern in the vulnerability event (the vuln model no longer accepts pathPattern).
    if (
      data.status === "falsePositive" &&
      data.pathPattern &&
      data.pathPattern.length > 0
    ) {
      const resp = await browserApiClient(
        "/organizations/" +
          activeOrg.slug +
          "/projects/" +
          project.slug +
          "/assets/" +
          asset.slug +
          "/refs/" +
          assetVersion?.slug +
          "/vex-rules",
        {
          method: "POST",
          body: JSON.stringify({
            cveId: vuln?.cveID,
            justification: data.justification ?? "",
            mechanicalJustification: data.mechanicalJustification ?? "",
            pathPattern: data.pathPattern,
          }),
        },
      );

      if (!resp.ok) {
        toast("Failed to create false positive rule", {
          description: "Please try again later.",
        });
        return false;
      }

      // Refresh the vuln details to reflect the applied rule
      await mutate();
      setJustification("");
      return true;
    }

    await mutate(async (prev) => {
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
            "/dependency-vulns/" +
            vuln.id +
            "/mitigate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              comment: data.justification,
            }),
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
            "/dependency-vulns/" +
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
      setJustification("");
      return {
        ...prev,
        ...json,
        events: prev?.events.concat([
          {
            ...json.events.slice(-1)[0],
            originalAssetVersionName: assetVersion?.name ?? "",
          },
        ]),
      };
    });
    return true;
  };

  const cvssVectorObj = parseCvssVector(vuln?.cve?.vector ?? "");
  const { short: exploitShort, long: ExploitLong } = exploitMessage(
    vuln,
    cvssVectorObj,
  );

  // Show error state
  if (error) {
    return (
      <Page
        Menu={assetMenu}
        Title={<AssetTitle />}
        title="Error Loading Vulnerability"
      >
        <Err />
      </Page>
    );
  }

  return (
    <Page
      Menu={assetMenu}
      Title={<AssetTitle />}
      title={vuln?.cve?.cve ?? "Vulnerability Details"}
    >
      <div className="flex flex-row gap-4">
        <div className="flex-1">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <h1 className="text-2xl font-semibold">
                {vuln ? vuln.cveID : <Skeleton className="w-52 h-10" />}
              </h1>
              <div className="mt-4 cve-description overflow-x-auto text-muted-foreground">
                {vuln ? (
                  <>
                    <Markdown>
                      {descriptionExpanded ||
                      (vuln.cve?.description?.length ?? 0) <= 800
                        ? vuln.cve?.description
                        : vuln.cve?.description?.slice(0, 800) + "..."}
                    </Markdown>
                    {(vuln.cve?.description?.length ?? 0) > 800 && (
                      <button
                        onClick={() =>
                          setDescriptionExpanded(!descriptionExpanded)
                        }
                        className="text-sm text-primary hover:opacity-80 my-2"
                      >
                        {descriptionExpanded ? "Show less" : "Read more"}
                      </button>
                    )}
                  </>
                ) : (
                  <Skeleton className="w-full h-20" />
                )}
              </div>
              <div className="mt-4 flex flex-row flex-wrap gap-2 text-sm">
                {vuln?.ticketUrl && (
                  <Link href={vuln.ticketUrl} target="_blank">
                    <Badge className="h-full" variant={"secondary"}>
                      {vuln.ticketId?.startsWith("github:") ? (
                        <Image
                          height={15}
                          src="/assets/github.svg"
                          alt="GitHub Logo"
                          className="-ml-1 mr-2 dark:invert"
                          width={15}
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

                {vuln ? (
                  <VulnState state={vuln.state} />
                ) : (
                  <Skeleton className="w-10 h-4" />
                )}
                {vuln ? (
                  <Severity risk={vuln.rawRiskAssessment} />
                ) : (
                  <Skeleton className="w-10 h-4" />
                )}
                {}
                {vuln?.artifacts.map((a) => (
                  <ArtifactBadge
                    key={a.artifactName + vuln.id}
                    artifactName={a.artifactName}
                  />
                ))}
              </div>
              <div>
                {!graphLoading && (
                  <div className="mt-10">
                    {graphData && vuln && (
                      <>
                        <div className="flex flex-row items-center justify-between mb-2">
                          <span className="font-semibold block">
                            Path to component
                          </span>
                          {(vuln?.vulnerabilityPath.length || 0) > 0 &&
                            (graphResponse?.length || 0) > 0 && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="secondary">
                                    <ShareIcon className="-ml-1 mr-1 inline-block h-4 w-4" />
                                    Vulnerability is reachable through{" "}
                                    {graphResponse?.length}{" "}
                                    {graphResponse?.length === 1
                                      ? "path"
                                      : "paths"}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-screen-sm font-normal">
                                  <p>
                                    This vulnerability exists in{" "}
                                    {graphResponse?.length} other dependency{" "}
                                    {graphResponse?.length === 1
                                      ? "path"
                                      : "paths"}{" "}
                                    within this asset. When marking as false
                                    positive, you can apply a rule to
                                    automatically mark all paths with matching
                                    suffixes.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                        </div>
                        <div
                          style={{ height: 400 }}
                          className={`w-full rounded-lg border ${theme === "light" ? "bg-gray-50" : "bg-black"} `}
                        >
                          {graphData && vuln && (
                            <DependencyGraph
                              variant="compact"
                              width={100}
                              height={400}
                              enableContextMenu={
                                vuln.vulnerabilityPath.length !== 0 &&
                                vuln.state === "open"
                              }
                              graph={graphData}
                              vulns={[vuln]}
                              highlightPath={[
                                "ROOT",
                                ...vuln.vulnerabilityPath,
                              ]}
                              onVexSelect={createFalsePositive}
                            />
                          )}
                        </div>
                      </>
                    )}
                    <div className="mt-4">
                      {(vuln?.vulnerabilityPath.length || 0) === 0 ? (
                        <Callout intent="warning" showIcon>
                          There are more than 12 different paths which lead to
                          this vulnerability in your dependency tree. Therefore
                          the graph is not displayed by default to avoid
                          performance issues. You can still mark this
                          vulnerability as false positive or accept the risk
                          using the buttons below.
                        </Callout>
                      ) : (
                        <Callout showIcon intent="neutral">
                          You can interact with the graph by zooming in/out,
                          clicking on edges to mark them as false positives and
                          remove nodes that are not relevant for dependency
                          propagation. You are trying to answer the question:{" "}
                          <b>
                            How does the vulnerability get inherited by my
                            project?
                          </b>{" "}
                          This will create{" "}
                          <Link
                            href={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/refs/${assetVersion?.slug}/vex-rules`}
                            className=""
                          >
                            VEX rules
                          </Link>
                          .
                        </Callout>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {vuln ? (
                <div className="mt-10">
                  <RiskAssessmentFeed
                    vulnerabilityName={vuln.cveID ?? ""}
                    events={vuln.events}
                    deleteEvent={handleDeleteEvent}
                    page="dependency-risks"
                  />
                  <div>
                    <Card>
                      <CardContent className="mt-4">
                        {vuln.state === "open" ? (
                          <form
                            className="flex flex-col gap-4"
                            onSubmit={(e) => e.preventDefault()}
                          >
                            <div className="flex flex-row justify-end gap-1">
                              <div className="flex flex-row items-start gap-2 pt-2">
                                {vuln.ticketId === null &&
                                  getIntegrationNameFromRepositoryIdOrExternalProviderId(
                                    asset,
                                    project,
                                  ) !== null && (
                                    <Button
                                      variant={"secondary"}
                                      onClick={() =>
                                        setMitigateDialogOpen(true)
                                      }
                                    >
                                      {getIntegrationNameFromRepositoryIdOrExternalProviderId(
                                        asset,
                                        project,
                                      ) === "gitlab" && (
                                        <GitProviderIcon
                                          externalEntityProviderIdOrRepositoryId={
                                            asset.externalEntityProviderId ??
                                            "gitlab"
                                          }
                                        />
                                      )}
                                      {getIntegrationNameFromRepositoryIdOrExternalProviderId(
                                        asset,
                                        project,
                                      ) === "github" && (
                                        <Image
                                          alt="GitHub Logo"
                                          width={15}
                                          height={15}
                                          className="dark:invert"
                                          src={"/assets/github.svg"}
                                        />
                                      )}
                                      {getIntegrationNameFromRepositoryIdOrExternalProviderId(
                                        asset,
                                        project,
                                      ) === "jira" && (
                                        <Image
                                          alt="Jira Logo"
                                          width={15}
                                          height={15}
                                          src={"/assets/jira-svgrepo-com.svg"}
                                        />
                                      )}
                                      <span className="ml-1">
                                        Create Ticket{" "}
                                      </span>
                                    </Button>
                                  )}
                                <Button
                                  onClick={() =>
                                    setFalsePositiveDialogOpen(true)
                                  }
                                  variant={"secondary"}
                                >
                                  Mark as False Positive
                                </Button>
                                <Button
                                  onClick={() => setAcceptRiskDialogOpen(true)}
                                  variant={"secondary"}
                                >
                                  Accept risk
                                </Button>
                                <Button
                                  onClick={() => setCommentDialogOpen(true)}
                                  variant={"default"}
                                >
                                  Comment
                                </Button>
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
                              You can reopen this vuln, if you plan to mitigate
                              the risk now, or accepted this vuln by accident.
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
              ) : (
                <>
                  <RiskAssessmentFeedSkeleton />
                  <div>
                    <EditorSkeleton />
                  </div>
                </>
              )}
            </div>
            {vuln ? (
              <div className="border-l">
                <div>
                  <ChartContainer config={{}} className="aspect-square w-full">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Total",
                            score: 10 - vuln.rawRiskAssessment,
                            fill: "hsl(var(--secondary))",
                          },
                          {
                            name: "Risk",
                            score: vuln.rawRiskAssessment,
                            fill: "hsl(var(--primary))",
                          },
                        ]}
                        startAngle={-270}
                        dataKey="score"
                        nameKey="name"
                        innerRadius={80}
                        strokeWidth={5}
                      >
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-3xl font-bold"
                                  >
                                    {vuln.rawRiskAssessment}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
                                  >
                                    Risk
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </div>
                <div className="p-5">
                  <Collapsible>
                    <CollapsibleTrigger className="flex w-full cursor-pointer flex-row items-center justify-between text-sm font-semibold">
                      Show detailed risk assessment
                      <CaretDownIcon />
                    </CollapsibleTrigger>
                    <small className="text-muted-foreground">
                      Last calculated at:{" "}
                      <FormatDate dateString={vuln.riskRecalculatedAt} />
                    </small>
                    <CollapsibleContent className="mt-4 flex flex-col gap-5 text-sm">
                      <div className="w-full border-b pb-4">
                        <div className="flex w-full flex-row items-center justify-between">
                          <span className="font-semibold">
                            EPSS{" "}
                            <Tooltip>
                              <TooltipTrigger>
                                <InformationCircleIcon className="inline h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-screen-sm font-normal">
                                <p>
                                  The epss score describes the propability of
                                  this vulnerability being exploited in the
                                  upcoming 30 days. The score gets recalculated
                                  every 24 hours and is the output of an AI
                                  model maintained by the FIRST organization,
                                  which is the publisher of the cvss standard
                                  itself.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                          <div className="whitespace-nowrap">
                            <Badge variant="outline">
                              {((vuln.cve?.epss ?? 0) * 100).toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {epssMessage(vuln.cve?.epss ?? 0)}
                        </p>
                      </div>
                      <div className="w-full border-b pb-4">
                        <div className="flex w-full flex-row items-center justify-between">
                          <span className="font-semibold">
                            Exploit{" "}
                            <Tooltip>
                              <TooltipTrigger>
                                <InformationCircleIcon className="inline h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-screen-sm font-normal">
                                <p>
                                  An exploit is software or commands that take
                                  advantage of a bug to cause unintended
                                  behavior, like unauthorized access or system
                                  disruption. Exploits can be shared on the dark
                                  web or GitHub. Many use these shared exploits
                                  because they can&quot;t create their own. If
                                  an exploit is available, <i>script kiddies</i>{" "}
                                  are more likely to use it.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                          <div className="whitespace-nowrap">
                            <Badge variant="outline">{exploitShort}</Badge>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {ExploitLong}
                        </p>
                      </div>
                      <div className="w-full border-b pb-4">
                        <div className="flex w-full flex-row items-center justify-between">
                          <span className="font-semibold">
                            Vulnerability depth{" "}
                            <Tooltip>
                              <TooltipTrigger>
                                <InformationCircleIcon className="inline h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-screen-sm font-normal">
                                <p>
                                  The depth of the component describes how many
                                  levels deep the vulnerability is in your
                                  project. The deeper a vulnerability is inside
                                  the tree, the propability decreases, that it
                                  can be exploited.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                          <div className="whitespace-nowrap">
                            <Badge variant="outline">
                              {vuln.vulnerabilityPath.filter((el) =>
                                el.startsWith("pkg:"),
                              ).length === 1
                                ? "Direct"
                                : "Transitive"}
                            </Badge>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {componentDepthMessages(
                            vuln.vulnerabilityPath.filter((el) =>
                              el.startsWith("pkg:"),
                            ).length ?? 0,
                          )}
                        </p>
                      </div>
                      <div className="w-full border-b pb-4">
                        <div className="flex w-full flex-row items-center justify-between">
                          <span className="font-semibold">
                            CVSS-BE{" "}
                            <Tooltip>
                              <TooltipTrigger>
                                <InformationCircleIcon className="inline h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-screen-sm font-normal">
                                <p>
                                  The cvss-be score describes the risk of this
                                  vulnerability in the context of the asset it
                                  affects. The score is calculated by the cvss
                                  standard and takes your asset requirements
                                  into account.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                          <div className="whitespace-nowrap">
                            <Badge variant="outline">
                              {(vuln.cve?.risk.withEnvironment ?? 0).toFixed(1)}
                            </Badge>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {cvssBE(asset!, cvssVectorObj)}
                        </p>
                      </div>

                      <div className="w-full">
                        <div className="flex w-full flex-row items-center justify-between">
                          <span className="font-semibold">
                            CVSS{" "}
                            <Tooltip>
                              <TooltipTrigger>
                                <InformationCircleIcon className="inline h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-screen-sm font-normal">
                                <p>
                                  The CVSS score indicates the severity of this
                                  vulnerability in general. It is calculated
                                  according to the CVSS standard and does not
                                  take into account your asset&quot;s specific
                                  requirements or any threat intelligence
                                  information.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                          <div className="whitespace-nowrap">
                            <Badge variant="outline">
                              {(vuln.cve?.risk.baseScore ?? 0).toFixed(1)}
                            </Badge>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {describeCVSS(cvssVectorObj)}
                        </p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                <AffectedComponentDetails vuln={vuln} />

                {vuln.componentPurl !== null && (
                  <div className="p-5">
                    <div className="flex flex-col gap-4">
                      {vuln.componentFixedVersion !== null && (
                        <>
                          <Quickfix
                            vuln={vuln.componentPurl}
                            version={
                              Boolean(vuln.componentFixedVersion)
                                ? (vuln.componentFixedVersion as string)
                                : ""
                            }
                            package={
                              Boolean(vuln.componentPurl)
                                ? (beautifyPurl(vuln.componentPurl) as string)
                                : ""
                            }
                          />
                        </>
                      )}
                    </div>
                  </div>
                )}
                <div className="p-5">
                  <h3 className="mb-2 text-sm font-semibold">
                    Management decisions across the organization
                  </h3>
                  {hints ? (
                    <div className="flex flex-row justify-between mt-4">
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant={"secondary"}>
                            <BugAntIcon className="-ml-1 mr-1 inline-block h-4 w-4" />
                            {hints.amountOpen}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-screen-sm font-normal">
                          This vulnerability is still open in {hints.amountOpen}{" "}
                          projects, artifacts and assets.
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant={"secondary"}>
                            <CheckCircleIcon className="-ml-1 mr-1 inline-block h-4 w-4" />
                            {hints.amountFixed}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-screen-sm font-normal">
                          This vulnerability has been fixed in{" "}
                          {hints.amountFixed} projects, artifacts and assets.
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant={"secondary"}>
                            <SpeakerXMarkIcon className="-ml-1 mr-1 inline-block h-4 w-4" />
                            {hints.amountAccepted}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-screen-sm font-normal">
                          This vulnerability has been accepted in{" "}
                          {hints.amountAccepted} projects, artifacts and assets.
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant={"secondary"}>
                            <StopIcon className="-ml-1 mr-1 inline-block h-4 w-4" />
                            {hints.amountFalsePositive}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-screen-sm font-normal">
                          This vulnerability has been marked as false positive
                          in {hints.amountFalsePositive} projects, artifacts and
                          assets.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  ) : (
                    <Skeleton className="w-full h-20" />
                  )}
                </div>
              </div>
            ) : (
              <div className="border-l flex-col pl-4 flex gap-8">
                <Skeleton className="w-full h-[250px]" />
                <Skeleton className="w-full h-20" />
                <Skeleton className="w-full h-[250px]" />
                <Skeleton className="w-full h-[250px]" />
                <Skeleton className="w-full h-[250px]" />
                <Skeleton className="w-full h-[250px]" />
              </div>
            )}
          </div>
        </div>
      </div>
      <CommentDialog
        open={commentDialogOpen}
        onOpenChange={setCommentDialogOpen}
        onSubmit={async (justification) => {
          return handleSubmit({
            status: "comment",
            justification,
          });
        }}
      />
      <MitigateDialog
        open={mitigateDialogOpen}
        onOpenChange={setMitigateDialogOpen}
        onSubmit={async (justification) => {
          return handleSubmit({
            status: "mitigate",
            justification,
          });
        }}
        integrationType={
          getIntegrationNameFromRepositoryIdOrExternalProviderId(
            asset,
            project,
          ) ?? undefined
        }
        gitlabIntegration={asset.externalEntityProviderId ?? "gitlab"}
      />

      <AcceptRiskDialog
        open={acceptRiskDialogOpen}
        onOpenChange={setAcceptRiskDialogOpen}
        onSubmit={async (justification) => {
          return handleSubmit({
            status: "accepted",
            justification,
          });
        }}
      />

      <FalsePositiveDialog
        open={falsePositiveDialogOpen}
        onOpenChange={setFalsePositiveDialogOpen}
        onSubmit={async (data) => {
          return handleSubmit({
            status: "falsePositive",
            justification: data.justification,
            mechanicalJustification: data.mechanicalJustification,
            pathPattern: data.pathPattern,
          });
        }}
        pathPatternOptions={
          vuln?.vulnerabilityPath.length === 0 ? [] : pathPatternOptions
        }
        vulnState={vuln?.state ?? ""}
        vexRulesUrl={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/refs/${assetVersion?.slug}/vex-rules`}
      />
    </Page>
  );
};

export default Index;
