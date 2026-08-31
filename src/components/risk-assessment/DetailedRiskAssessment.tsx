// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { Badge } from "@/components/ui/badge";
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
import type { AssetDTO } from "@/types/dto";
import type { DetailedDependencyVulnDTO } from "@/types/view/vulnEvents";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { ChevronDown } from "lucide-react";
import type { FunctionComponent, ReactNode } from "react";
import Link from "next/link";
import FormatDate from "./FormatDate";

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
  if (asset.availabilityRequirement === "high" && cvssObj["A"] === "H") {
    str +=
      "Exploiting this vulnerability is critical because the asset requires high availability, and the vulnerability significantly impacts availability.";
  } else if (cvssObj["A"] === "H") {
    str += "Exploiting this vulnerability significantly impacts availability.";
  }

  if (asset.integrityRequirement === "high" && cvssObj["I"] === "H") {
    str +=
      "Exploiting this vulnerability is critical because the asset requires high integrity, and the vulnerability significantly impacts integrity.";
  } else if (cvssObj["I"] === "H") {
    str += "Exploiting this vulnerability significantly impacts integrity.";
  }

  if (asset.confidentialityRequirement === "high" && cvssObj["C"] === "H") {
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

interface DetailedRiskAssessmentProps {
  vuln: DetailedDependencyVulnDTO;
  asset: AssetDTO;
}

const DetailedRiskAssessment: FunctionComponent<
  DetailedRiskAssessmentProps
> = ({ vuln, asset }) => {
  const cvssVectorObj = parseCvssVector(vuln.cve?.vector ?? "");
  const { short: exploitShort, long: ExploitLong } = exploitMessage(
    vuln,
    cvssVectorObj,
  );

  return (
    <div className="p-5">
      <Collapsible>
        <CollapsibleTrigger className="group flex w-full cursor-pointer flex-row items-center justify-between text-xs font-semibold">
          Show detailed risk assessment
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
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
                      vulnerability being exploited in the upcoming 30 days. The
                      score gets recalculated every 24 hours and is the output
                      of an AI model maintained by the FIRST organization, which
                      is the publisher of the cvss standard itself.
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
                      An exploit is software or commands that take advantage of
                      a bug to cause unintended behavior, like unauthorized
                      access or system disruption. Exploits can be shared on the
                      dark web or GitHub. Many use these shared exploits because
                      they can&quot;t create their own. If an exploit is
                      available, <i>script kiddies</i> are more likely to use
                      it.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </span>
              <div className="whitespace-nowrap">
                <Badge variant="outline">{exploitShort}</Badge>
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{ExploitLong}</p>
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
                      The depth of the component describes how many levels deep
                      the vulnerability is in your project. The deeper a
                      vulnerability is inside the tree, the propability
                      decreases, that it can be exploited.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </span>
              <div className="whitespace-nowrap">
                <Badge variant="outline">
                  {vuln.vulnerabilityPath.filter((el) => el.startsWith("pkg:"))
                    .length === 1
                    ? "Direct"
                    : "Transitive"}
                </Badge>
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {componentDepthMessages(
                vuln.vulnerabilityPath.filter((el) => el.startsWith("pkg:"))
                  .length ?? 0,
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
                      The cvss-be score describes the risk of this vulnerability
                      in the context of the asset it affects. The score is
                      calculated by the cvss standard and takes your asset
                      requirements into account.
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
              {cvssBE(asset, cvssVectorObj)}
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
                      vulnerability in general. It is calculated according to
                      the CVSS standard and does not take into account your
                      asset&quot;s specific requirements or any threat
                      intelligence information.
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
  );
};

export default DetailedRiskAssessment;
