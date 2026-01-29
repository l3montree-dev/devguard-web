// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import {
  DetailedDependencyVulnDTO,
  PURLInspectResponse,
  VulnInPackage,
} from "@/types/api/api";
import { FunctionComponent, useEffect, useMemo, useState } from "react";
import EcosystemImage from "./common/EcosystemImage";
import { beautifyPurl, extractVersion } from "@/utils/common";
import { Badge } from "./ui/badge";

import Image from "next/image";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { CaretDownIcon } from "@radix-ui/react-icons";

const AffectedComponentDetails: FunctionComponent<{
  vuln: DetailedDependencyVulnDTO;
}> = ({ vuln }) => {
  const [data, setData] = useState<PURLInspectResponse | null>(null);
  const [activeCVE, setActiveCVE] = useState<VulnInPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { theme } = useTheme();

  const purl = vuln.componentPurl;

  const url = useMemo(
    () =>
      `/api/devguard-tunnel/api/v1/vulndb/purl-inspect/${encodeURIComponent(purl ?? "")}`,
    [purl],
  );

  useEffect(() => {
    if (!purl) {
      setIsLoading(false);
      setError(true);
      return;
    }

    const abortController = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      setError(false);

      try {
        const response = await fetch(url, {
          cache: "no-store",
          signal: abortController.signal,
        });

        if (!response.ok) {
          setError(true);
          return;
        }

        const result = (await response.json()) as PURLInspectResponse;
        setData(result);

        const matchedCVE = result.vulns.find(
          (vulnInPkg) => vuln.cveID === vulnInPkg.CVEID,
        );
        if (matchedCVE) {
          setActiveCVE(matchedCVE);
        }
      } catch (err) {
        // Don't set error if request was aborted
        if (err instanceof Error && err.name !== "AbortError") {
          setError(true);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [url, purl, vuln.cveID]);

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
      {vuln.cve?.relationships && vuln.cve.relationships.length > 0 && (
        <div className="p-5">
          <h3 className="mb-2 text-sm font-semibold">
            Vulnerability Details{" "}
            <Image
              src={
                theme === "light" ? "/logos/osv-black.png" : "/logos/osv.png"
              }
              alt="OSV Logo"
              width={40}
              height={40}
              className="inline-block ml-2 mb-1"
            />
          </h3>
          <div className="flex flex-col gap-2">
            <div className="rounded-lg border bg-card p-4">
              {vuln.cve?.relationships && (
                <table className="w-full table-auto border-collapse">
                  <tbody>
                    {vuln.cve?.relationships?.map((rel) => (
                      <tr
                        className="text-sm"
                        key={rel.relationshipType + rel.targetCve}
                      >
                        <td className="capitalize font-semibold">
                          {rel.relationshipType}
                        </td>
                        <td>{rel.targetCve}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <Link
              target="_blank"
              className="text-xs"
              href={"https://osv.dev/vulnerability/" + vuln.cveID}
            >
              See vulnerability on osv.dev
            </Link>
          </div>
        </div>
      )}
      <div className="p-5">
        <h3 className="mb-2 text-sm font-semibold">Affected component</h3>
        <div className="flex flex-col gap-4">
          <Collapsible>
            <div className="rounded-lg border bg-card p-4">
              <CollapsibleTrigger className="flex w-full flex-row items-center justify-between text-sm font-semibold">
                <p className="text-sm">
                  <span className="flex flex-row gap-2">
                    <EcosystemImage packageName={purl} />{" "}
                    <span className="flex-1 text-left">{beautifyPurl(purl)}</span>
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
                    {activeCVE?.FixedVersion ??
                      vuln.componentFixedVersion ??
                      "no patch available"}
                  </Badge>
                </div>
                <CollapsibleContent className="border-t pt-4 mt-4">
                  <div className="mt-1 flex flex-col text-xs">
                    <span className="text-muted-foreground">Search PURL:</span>
                    <div>{data.matchContext?.SearchPurl ?? "unknown"}</div>
                  </div>
                  <div className="mt-3 flex flex-col text-xs">
                    <span className="text-muted-foreground">Version Type:</span>
                    <div>
                      {data.matchContext?.HowToInterpretVersionString ??
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
                </CollapsibleContent>
              </div>
            </div>
          </Collapsible>
        </div>
        <div className="mt-1">
          <Link
            target="_blank"
            className="text-xs"
            href={
              "https://devguard.org/explanations/vulnerability-management/vulnerability-matching"
            }
          >
            See how DevGuard matches vulnerabilities
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AffectedComponentDetails;
