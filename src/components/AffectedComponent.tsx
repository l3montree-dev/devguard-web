// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type {
  DetailedDependencyVulnDTO,
  PURLInspectResponse,
} from "@/types/api/api";
import { beautifyPurl, extractVersion } from "@/utils/common";
import { useMemo, type FunctionComponent } from "react";
import EcosystemImage from "./common/EcosystemImage";
import { Badge } from "./ui/badge";

import { fetcher } from "@/data-fetcher/fetcher";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { DocDrawer } from "@/components/common/DocDrawer";

const AffectedComponentDetails: FunctionComponent<{
  vuln: DetailedDependencyVulnDTO;
}> = ({ vuln }) => {
  const { theme } = useTheme();

  const purl = vuln.componentPurl;

  const url = useMemo(
    () => (purl ? `/vulndb/purl-inspect/${encodeURIComponent(purl)}` : null),
    [purl],
  );

  const { data, isLoading, error } = useSWR<PURLInspectResponse>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // Compute the matched CVE from the fetched data
  const activeCVE = useMemo(() => {
    if (!data) return null;
    return (
      data.vulns.find((vulnInPkg) => vuln.cveID === vulnInPkg.CVEID) ?? null
    );
  }, [data, vuln.cveID]);

  if (isLoading) {
    return (
      <span className="font-mono text-muted-foreground">
        {purl ?? "Loading..."}
      </span>
    );
  }

  if (error || !data || !purl) {
    return <span className="font-mono">{purl ?? "Unknown component"}</span>;
  }

  return (
    <div>
      <div className="p-5">
        <h3 className="mb-2 text-xs font-semibold">Affected component</h3>
        <div className="flex flex-col gap-4">
          <Collapsible>
            <div className="rounded-lg border bg-card p-3">
              <CollapsibleTrigger className="flex cursor-pointer w-full flex-row items-center justify-between text-sm font-semibold">
                <p className="text-sm">
                  <span className="flex flex-row gap-2">
                    <EcosystemImage packageName={purl} />{" "}
                    <span className="flex-1 text-left mt-0.75 text-xs">
                      {beautifyPurl(purl)}
                    </span>
                  </span>
                </p>
                <CaretDownIcon />
              </CollapsibleTrigger>
              <div className="mt-4 text-sm">
                {" "}
                <div className="mt-1 flex flex-row justify-between">
                  <span className="text-xs text-muted-foreground">
                    Installed version:{" "}
                  </span>
                  <Badge variant={"outline"}>
                    {extractVersion(purl) ?? "unknown"}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-row justify-between">
                  <span className="text-xs text-muted-foreground">
                    Fixed in:{" "}
                  </span>
                  <Badge variant={"outline"}>
                    {vuln.directDependencyFixedVersion ||
                      "" ||
                      vuln.componentFixedVersion ||
                      "" ||
                      "no patch available"}
                  </Badge>
                </div>
                <CollapsibleContent className="border-t pt-4 mt-4">
                  <div className="mt-1 flex flex-col text-xs">
                    <span className="text-muted-foreground">Search PURL:</span>
                    <div>{data.matchContext?.searchPurl ?? "unknown"}</div>
                  </div>
                  {data.matchContext?.qualifiers &&
                    Object.keys(data.matchContext.qualifiers).length > 0 && (
                      <div className="mt-3 flex flex-col text-xs">
                        <span className="text-muted-foreground">
                          Qualifiers:
                        </span>
                        <ul className="mt-1 list-none space-y-0.5">
                          {Object.entries(data.matchContext.qualifiers).map(
                            ([, value]: [string, any]) => (
                              <li key={value.Key ?? value}>
                                <span className="text-muted-foreground">
                                  {value.Key ?? value}:
                                </span>{" "}
                                {value.Value ?? ""}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                  <div className="mt-3 flex flex-col text-xs">
                    <span className="text-muted-foreground">Version Type:</span>
                    <div>
                      {data.matchContext?.howToInterpretVersionString ??
                        "unknown"}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col text-xs">
                    <span className="text-muted-foreground">Matched CVEs:</span>
                  </div>
                  <div className="mt-1 flex flex-wrap justify-start gap-1">
                    {data.affectedComponents
                      .flatMap((component) => component.cves)
                      .map((cve, index) => (
                        <Link
                          key={`${cve.cveID}-${index}`}
                          href={`https://osv.dev/vulnerability/${cve.cve}`}
                          target="_blank"
                          className="!text-xs"
                        >
                          {String(cve.cve)}
                        </Link>
                      ))}
                  </div>
                  {vuln.cve?.relationships &&
                    vuln.cve.relationships.length > 0 && (
                      <div className="mt-3 flex flex-col text-xs">
                        <span className="text-muted-foreground">
                          Relationships:
                        </span>
                        <ul className="mt-1 list-none space-y-0.5">
                          {vuln.cve.relationships.map((rel) => (
                            <li
                              key={rel.relationshipType + rel.targetCve}
                              className="flex flex-row gap-2"
                            >
                              <Link
                                href={`https://osv.dev/vulnerability/${rel.targetCve}`}
                                target="_blank"
                                className="!text-xs"
                              >
                                {rel.targetCve}
                              </Link>
                              <span className="capitalize text-muted-foreground">
                                ({rel.relationshipType})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  <div className="mt-4 border-t pt-4">
                    <DocDrawer
                      triggerLabel="See how DevGuard matches vulnerabilities"
                      drawerTitle="Vulnerability Matching"
                      mdxUrl="https://raw.githubusercontent.com/l3montree-dev/devguard-documentation/main/src/pages/explanations/vulnerability-management/vulnerability-matching.mdx"
                      docsUrl="https://docs.devguard.org/explanations/vulnerability-management/vulnerability-matching/"
                    />
                  </div>
                </CollapsibleContent>
              </div>
            </div>
          </Collapsible>
        </div>
      </div>
    </div>
  );
};

export default AffectedComponentDetails;
