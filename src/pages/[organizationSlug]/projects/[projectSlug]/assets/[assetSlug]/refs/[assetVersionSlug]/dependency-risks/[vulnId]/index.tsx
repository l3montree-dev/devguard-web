import Page from "@/components/Page";

import VulnState from "@/components/common/VulnState";

import Severity from "@/components/common/Severity";
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
  AssetDTO,
  DetailedDependencyVulnDTO,
  RequirementsLevel,
  VulnEventDTO,
} from "@/types/api/api";
import Image from "next/image";
import { Label, Pie, PieChart } from "recharts";

import RiskAssessmentFeed from "@/components/risk-assessment/RiskAssessmentFeed";
import { AsyncButton, Button, buttonVariants } from "@/components/ui/button";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FunctionComponent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import Markdown from "react-markdown";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { withOrganization } from "@/decorators/withOrganization";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

import AssetTitle from "@/components/common/AssetTitle";
import EcosystemImage from "@/components/common/EcosystemImage";
import FormatDate from "@/components/risk-assessment/FormatDate";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { withAssetVersion } from "@/decorators/withAssetVersion";
import { withContentTree } from "@/decorators/withContentTree";
import { beautifyPurl, extractVersion, getEcosystem } from "@/utils/common";
import {
  getIntegrationNameFromRepositoryIdOrExternalProviderId,
  removeUnderscores,
  vexOptionMessages,
} from "@/utils/view";
import { useStore } from "@/zustand/globalStoreProvider";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import GitProviderIcon from "../../../../../../../../../../components/GitProviderIcon";
import ScannerBadge from "../../../../../../../../../../components/ScannerBadge";
import CopyCode from "@/components/common/CopyCode";
import { useActiveAssetVersion } from "../../../../../../../../../../hooks/useActiveAssetVersion";
const MarkdownEditor = dynamic(
  () => import("@/components/common/MarkdownEditor"),
  {
    ssr: false,
  },
);

interface Props {
  vuln: DetailedDependencyVulnDTO;
}

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
  vuln: DetailedDependencyVulnDTO,
  obj: { [key: string]: string },
): {
  short: string;
  long: ReactNode;
} => {
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
      case "deb": {
        return {
          globalUpdate: `apt update && apt upgrade`,
          ecosystemUpdate: `apt-get install -y ${props.package}=${props.version}`,
        };
      }
      default:
        return {
          globalUpdate: ``,
          ecosystemUpdate: ``,
        };
    }
  }, []);

  return (
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

const Index: FunctionComponent<Props> = (props) => {
  const router = useRouter();
  const [vuln, setVuln] = useState<DetailedDependencyVulnDTO>(props.vuln);
  useEffect(() => {
    setVuln(props.vuln);
  }, [props.vuln]);
  const cve = vuln.cve;

  const activeOrg = useActiveOrg();
  const project = useActiveProject();

  const assetMenu = useAssetMenu();
  const asset = useActiveAsset()!;
  const assetVersion = useActiveAssetVersion();

  const [justification, setJustification] = useState<string | undefined>(
    undefined,
  );

  const [selectedOption, setSelectedOption] = useState<string>(
    Object.keys(vexOptionMessages)[2],
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
        "/api/v1/organizations/" +
          activeOrg.slug +
          "/projects/" +
          project.slug +
          "/assets/" +
          asset.slug +
          "/refs/" +
          assetVersion?.name +
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
        "",
      );
      json = await resp.json();
    } else {
      const resp = await browserApiClient(
        "/api/v1/organizations/" +
          activeOrg.slug +
          "/projects/" +
          project.slug +
          "/assets/" +
          asset.slug +
          "/refs/" +
          assetVersion?.name +
          "/dependency-vulns/" +
          vuln.id,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
        "",
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
          assetVersionName: assetVersion?.name ?? "",
        },
      ]),
    }));
    setJustification("");
  };

  const cvssVectorObj = parseCvssVector(cve?.vector ?? "");
  const { short: exploitShort, long: ExploitLong } = exploitMessage(
    vuln,
    cvssVectorObj,
  );

  return (
    <Page
      Menu={assetMenu}
      Title={<AssetTitle />}
      title={vuln.cve?.cve ?? "Vuln Details"}
    >
      <div className="flex flex-row gap-4">
        <div className="flex-1">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <h1 className="text-2xl font-semibold">{vuln.cveID}</h1>
              <p className="mt-4 text-muted-foreground">
                {vuln.cve?.description}
              </p>
              <div className="mt-4 flex flex-row flex-wrap gap-2 text-sm">
                {vuln.ticketUrl && (
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

                <VulnState state={vuln.state} />
                {cve && <Severity risk={vuln.rawRiskAssessment} />}
                {vuln.scannerIds.split(" ").map((s) => (
                  <ScannerBadge key={s} scannerID={s} />
                ))}
              </div>
              <div className="mb-16 mt-4">
                <Markdown>{vuln.message?.replaceAll("\n", "\n\n")}</Markdown>
              </div>

              <RiskAssessmentFeed
                vulnerabilityName={vuln.cveID ?? ""}
                events={vuln.events}
              />
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
                          <div className="flex flex-row items-start gap-2 pt-2">
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
                                    <div className="flex flex-row items-center">
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
                            <div className="flex flex-col items-center">
                              <div className="flex flex-row items-center">
                                <AsyncButton
                                  onClick={() =>
                                    handleSubmit({
                                      status: "falsePositive",
                                      justification,
                                      mechanicalJustification: selectedOption,
                                    })
                                  }
                                  variant={"secondary"}
                                  className="mr-0 capitalize rounded-r-none pr-0"
                                >
                                  {removeUnderscores(selectedOption)}
                                </AsyncButton>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant={"secondary"}
                                      className=" flex items-center rounded-l-none pl-1 pr-2"
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>

                                  <DropdownMenuContent align="end">
                                    {Object.entries(vexOptionMessages).map(
                                      ([option, description]) => (
                                        <DropdownMenuItem
                                          key={option}
                                          onClick={() =>
                                            setSelectedOption(option)
                                          }
                                        >
                                          <div className="flex flex-col">
                                            <span className="capitalize">
                                              {removeUnderscores(option)}{" "}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              {description}
                                            </span>
                                          </div>
                                        </DropdownMenuItem>
                                      ),
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <div className="flex-1 w-full">
                                <span className=" text-left text-xs text-muted-foreground">
                                  {"Mark as False Positive"}
                                </span>
                              </div>
                            </div>

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
                  <CollapsibleTrigger className="flex w-full flex-row items-center justify-between text-sm font-semibold">
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
                                The epss score describes the propability of this
                                vulnerability being exploited in the upcoming 30
                                days. The score gets recalculated every 24 hours
                                and is the output of an AI model maintained by
                                the FIRST organization, which is the publisher
                                of the cvss standard itself.
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
                                advantage of a bug to cause unintended behavior,
                                like unauthorized access or system disruption.
                                Exploits can be shared on the dark web or
                                GitHub. Many use these shared exploits because
                                they can&quot;t create their own. If an exploit
                                is available, <i>script kiddies</i> are more
                                likely to use it.
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
                                the tree, the propability decreases, that it can
                                be exploited.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </span>
                        <div className="whitespace-nowrap">
                          <Badge variant="outline">
                            {vuln.componentDepth === 1
                              ? "Direct"
                              : "Transitive"}
                          </Badge>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {componentDepthMessages(vuln.componentDepth ?? 0)}
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
                                standard and takes your asset requirements into
                                account.
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
                                according to the CVSS standard and does not take
                                into account your asset&quot;s specific
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
              {vuln.componentPurl !== null && (
                <div className="p-5">
                  <h3 className="mb-2 text-sm font-semibold">
                    Affected component
                  </h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="rounded-lg border bg-card p-4">
                        <p className="text-sm">
                          <span className="flex flex-row gap-2">
                            <EcosystemImage packageName={vuln.componentPurl} />{" "}
                            {beautifyPurl(vuln.componentPurl)}
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
                          <div className="mt-1 flex flex-row justify-between">
                            <span className="text-xs text-muted-foreground">
                              Fixed in:{" "}
                            </span>
                            <Badge variant={"outline"}>
                              {Boolean(vuln.componentFixedVersion)
                                ? vuln.componentFixedVersion
                                : "no patch available"}
                            </Badge>
                          </div>
                          <div className="mt-4">
                            <Link
                              className={buttonVariants({ variant: "outline" })}
                              href={
                                router.asPath +
                                "/../../dependencies/graph?pkg=" +
                                vuln.componentPurl +
                                "&scanner=" +
                                vuln.scannerIds.split(" ")[0]
                              }
                            >
                              Show in dependency graph
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
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
      "/dependency-vulns/" +
      vulnId;

    const [resp]: [Response] = await Promise.all([apiClient(uri)]);

    if (!resp.ok) {
      return {
        notFound: true,
      };
    }
    const detailedDependencyVulnDTO = await resp.json();

    return {
      props: {
        vuln: detailedDependencyVulnDTO,
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
