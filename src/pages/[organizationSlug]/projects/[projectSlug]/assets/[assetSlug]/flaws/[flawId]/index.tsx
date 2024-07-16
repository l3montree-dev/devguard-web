import Page from "@/components/Page";

import FlawState from "@/components/common/FlawState";

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
  DetailedFlawDTO,
  FlawEventDTO,
  RequirementsLevel,
} from "@/types/api/api";
import Image from "next/image";
import { Label, Pie, PieChart } from "recharts";

import RiskAssessmentFeed from "@/components/risk-assessment/RiskAssessmentFeed";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { FunctionComponent, ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { withOrganization } from "@/decorators/withOrganization";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { CaretDownIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
const MarkdownEditor = dynamic(
  () => import("@/components/common/MarkdownEditor"),
  {
    ssr: false,
  },
);

interface Props {
  flaw: DetailedFlawDTO;
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
  flaw: DetailedFlawDTO,
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
            {flaw.cve?.exploits.map((exploit) => (
              <Link key={exploit.sourceURL} href={exploit.sourceURL}>
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
          A functional exploit is available for this vulnerability:
          <div>
            {flaw.cve?.exploits.map((exploit) => (
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

  return (
    `${baseScores["AV"][cvss["AV"]]}\n` +
    `${baseScores["AC"][cvss["AC"]]}\n` +
    `${baseScores["PR"][cvss["PR"]]}\n` +
    `${baseScores["UI"][cvss["UI"]]}\n` +
    `${baseScores["S"][cvss["S"]]}\n` +
    `${baseScores["C"][cvss["C"]]}\n` +
    `${baseScores["I"][cvss["I"]]}\n` +
    `${baseScores["A"][cvss["A"]]}`
  );
};

const getEcosystem = (packageName: string) => {
  if (packageName.startsWith("pkg:")) {
    return packageName.split(":")[1].split("/")[0];
  } else if (packageName.includes("/")) {
    return packageName.split("/")[0];
  }
  return packageName;
};

const Index: FunctionComponent<Props> = (props) => {
  const router = useRouter();
  const [flaw, setFlaw] = useState<DetailedFlawDTO>(props.flaw);
  const cve = flaw.cve;

  const activeOrg = useActiveOrg();
  const project = useActiveProject();

  const assetMenu = useAssetMenu();
  const asset = useActiveAsset();

  const form = useForm<{
    status: FlawEventDTO["type"];
    justification: string;
  }>();

  const handleSubmit = async (data: {
    status?: FlawEventDTO["type"];
    justification?: string;
  }) => {
    if (data.status === undefined) {
      return;
    }

    if (!Boolean(data.justification)) {
      data.justification = "set as " + data.status;
    }

    const resp = await browserApiClient(
      "/api/v1/organizations/" + router.asPath,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
      "",
    );
    const json = await resp.json();

    setFlaw((prev) => ({ ...prev, ...json }));
  };

  const cvssVectorObj = parseCvssVector(cve?.vector ?? "");
  const { short: exploitShort, long: ExploitLong } = exploitMessage(
    flaw,
    cvssVectorObj,
  );

  return (
    <Page
      Menu={assetMenu}
      Title={
        <span className="flex flex-row gap-2">
          <Link
            href={`/${activeOrg.slug}`}
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
          <span className="opacity-75">/</span>
          <Link
            className="flex flex-row items-center gap-1 !text-white hover:no-underline"
            href={`/${activeOrg.slug}/projects/${project?.slug}`}
          >
            {project?.name}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Project
            </Badge>
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="flex items-center gap-1 text-white hover:no-underline"
            href={`/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}`}
          >
            {asset?.name}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Asset
            </Badge>
          </Link>

          <span className="opacity-75">/</span>
          <span className="flex flex-row items-center gap-1">
            {flaw.cve?.cve ?? "Flaw Details"}{" "}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Flaw
            </Badge>
          </span>
        </span>
      }
      title={flaw.cve?.cve ?? "Flaw Details"}
    >
      <div className="flex flex-row gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{flaw.cveId}</h1>

          <p className="mt-4 text-muted-foreground">{flaw.cve?.description}</p>

          <div className="mt-4 flex flex-row gap-2 text-sm">
            <FlawState state={flaw.state} />
            {cve && <Severity severity={cve.severity} />}
          </div>
          <div className="mb-16 mt-4">
            <Markdown>{flaw.message?.replaceAll("\n", "\n\n")}</Markdown>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <RiskAssessmentFeed
                flawName={flaw.cve?.cve ?? ""}
                events={flaw.events}
              />
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Update the status</CardTitle>
                    <CardDescription></CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form
                        className="flex flex-col gap-4"
                        onSubmit={form.handleSubmit(handleSubmit)}
                      >
                        <FormField
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="falsePositive">
                                      False Positive
                                    </SelectItem>
                                    <SelectItem value="accepted">
                                      Accepted
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <small className="text-muted-foreground">
                          Select the current status to update the record
                          accurately:
                          <ol>
                            <li>
                              Accepted: Accepts the risk the flaw poses to the
                              organization. It mutes the flaw. Detecting this
                              flaw again won&apos;t have an impact on the
                              pipeline result.
                            </li>
                            <li>
                              False Positive: Mutes the flaw permanently as it
                              is identified as a non-issue.
                            </li>
                          </ol>
                        </small>

                        <FormField
                          name="justification"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Justification</FormLabel>
                              <FormControl>
                                <MarkdownEditor
                                  value={field.value ?? ""}
                                  setValue={(v) => field.onChange(v)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <div className="flex flex-row justify-end">
                          <Button type="submit">Submit</Button>
                        </div>
                      </form>
                    </Form>
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
                          score: 10 - flaw.rawRiskAssessment,
                          fill: "hsl(var(--secondary))",
                        },
                        {
                          name: "Risk",
                          score: flaw.rawRiskAssessment,
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
                                  {flaw.rawRiskAssessment}
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
                            {(flaw.cve?.epss ?? 0) * 100}%
                          </Badge>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {epssMessage(flaw.cve?.epss ?? 0)}
                      </p>
                    </div>
                    <div className="w-full border-b pb-4">
                      <div className="flex w-full flex-row items-center justify-between">
                        <span className="font-semibold">Exploit</span>
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
                            {flaw.cve?.risk.withEnvironment ?? 0}
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
                            {flaw.cve?.risk.baseScore ?? 0}
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
              {flaw.arbitraryJsonData !== null && (
                <div className="p-5">
                  <h3 className="mb-2 text-sm font-semibold">
                    Affected component
                  </h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="rounded bg-card p-4">
                        <p className="text-sm">
                          <span className="flex flex-row gap-2">
                            {[
                              "Go",
                              "npm",
                              "Maven",
                              "crates.io",
                              "Packagist",
                              "RubyGems",
                              "NuGet",
                            ].includes(
                              getEcosystem(flaw.arbitraryJsonData.packageName),
                            ) && (
                              <Image
                                alt={
                                  "Logo von " +
                                  getEcosystem(
                                    flaw.arbitraryJsonData.packageName,
                                  )
                                }
                                width={15}
                                height={15}
                                src={
                                  "/logos/" +
                                  getEcosystem(
                                    flaw.arbitraryJsonData.packageName,
                                  ).toLowerCase() +
                                  "-svgrepo-com.svg"
                                }
                              />
                            )}{" "}
                            {flaw.arbitraryJsonData.packageName.replace(
                              "pkg:",
                              "",
                            )}
                          </span>
                        </p>
                        <div className="mt-4 text-sm">
                          <div className="flex flex-row justify-between">
                            <span className="text-xs text-muted-foreground">
                              Introduced in:{" "}
                            </span>
                            <Badge variant={"outline"}>
                              {flaw.arbitraryJsonData.introducedVersion ??
                                "von Beginn an"}
                            </Badge>
                          </div>
                          <div className="mt-1 flex flex-row justify-between">
                            <span className="text-xs text-muted-foreground">
                              Installed version:{" "}
                            </span>
                            <Badge variant={"outline"}>
                              {flaw.arbitraryJsonData.installedVersion ??
                                "von Beginn an"}
                            </Badge>
                          </div>
                          <div className="mt-1 flex flex-row justify-between">
                            <span className="text-xs text-muted-foreground">
                              Fixed in:{" "}
                            </span>
                            <Badge variant={"outline"}>
                              {flaw.arbitraryJsonData.fixedVersion ??
                                "kein Patch verfügbar"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
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
  async (context: GetServerSidePropsContext) => {
    // fetch the project
    const { organizationSlug, projectSlug, assetSlug, flawId } =
      context.params!;

    const apiClient = getApiClientFromContext(context);
    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/flaws/" +
      flawId;

    const resp: DetailedFlawDTO = await (await apiClient(uri)).json();

    return {
      props: {
        flaw: resp,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    asset: withAsset,
    project: withProject,
  },
);

export default Index;
