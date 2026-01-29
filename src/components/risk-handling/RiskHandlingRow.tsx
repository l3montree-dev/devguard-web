// Copyright (C) 2024 Tim Bastin, l3montree GmbH
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { VulnByPackage, VulnWithCVE } from "@/types/api/api";
import { beautifyPurl, classNames, extractVersion } from "@/utils/common";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Row } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { FunctionComponent, useMemo, useState } from "react";
import useDecodedPathname from "../../hooks/useDecodedPathname";
import AcceptRiskDialog from "../AcceptRiskDialog";
import FalsePositiveDialog from "../FalsePositiveDialog";
import Severity from "../common/Severity";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Tooltip, TooltipContent } from "../ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { LinkBreak2Icon } from "@radix-ui/react-icons";
import EcosystemImage from "../common/EcosystemImage";
import { groupBy } from "lodash";
import { toast } from "sonner";

interface Props {
  row: Row<VulnByPackage>;
  index: number;
  arrLength: number;
  selectedVulnIds: Set<string>;
  onToggleVuln: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  onBulkAction: (params: {
    vulnIds: string[];
    status: string;
    justification: string;
    mechanicalJustification?: string;
  }) => Promise<void>;
  hasSession: boolean;
}

const VulnWithCveTableRow = ({
  vuln,
  href,
  selectable,
  selected,
  onToggle,
  hasSession,
}: {
  vuln: VulnWithCVE;
  href: string;
  selectable: boolean;
  selected: boolean;
  onToggle: () => void;
  hasSession: boolean;
}) => {
  const router = useRouter();
  return (
    <tr
      className="border-b border-gray-100 dark:border-white/5 hover:bg-muted/30 cursor-pointer"
      key={vuln.id}
      onClick={(e) => {
        // Don't navigate if clicking on checkbox
        if (
          (e.target as HTMLElement).closest('button, input, [role="checkbox"]')
        )
          return;
        router.push(href);
      }}
    >
      <td className="py-3 pl-[72px] pr-4">
        <div className="flex items-start gap-3">
          {selectable && (
            <div className="pt-0.5 ml-6" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={selected}
                onCheckedChange={onToggle}
                disabled={!hasSession}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Tooltip>
              <TooltipTrigger className="text-left">
                <div className="text-sm text-foreground truncate max-w-md">
                  <span className="mr-2 text-xs text-muted-foreground">
                    {vuln.state !== "open" && <>{vuln.state}, </>}
                    {vuln.vulnerabilityPath.length === 1
                      ? "Direct"
                      : `${vuln.vulnerabilityPath.length} hops`}
                  </span>
                  {vuln.vulnerabilityPath.length <= 2 ? (
                    <span>
                      {vuln.vulnerabilityPath.map((p, i) => (
                        <span key={i}>
                          {i > 0 && " → "}
                          <Badge variant="outline">{beautifyPurl(p)}</Badge>
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span>
                      <Badge variant="outline">
                        {beautifyPurl(vuln.vulnerabilityPath[0])}
                      </Badge>
                      {" → ... → "}
                      <Badge variant="outline">
                        {beautifyPurl(
                          vuln.vulnerabilityPath[
                            vuln.vulnerabilityPath.length - 1
                          ],
                        )}
                      </Badge>
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex flex-wrap flex-row items-start gap-2 break-all max-w-md">
                  {vuln.vulnerabilityPath.map((el, i) => (
                    <span className="flex flex-row items-center gap-1" key={i}>
                      <EcosystemImage size={12} packageName={el} />
                      {beautifyPurl(el)}
                      {i < vuln.vulnerabilityPath.length - 1 ? " → " : null}
                    </span>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 flex-col">
        <div className="flex">
          <Severity risk={vuln.rawRiskAssessment} />
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm">{(vuln.cve?.cvss ?? 0).toFixed(1)}</span>
      </td>
      <td className="py-3 px-4"></td>
    </tr>
  );
};

const RiskHandlingRow: FunctionComponent<Props> = ({
  row,
  index,
  selectedVulnIds,
  onToggleVuln,
  onToggleAll,
  hasSession,
}) => {
  const [isPackageOpen, setIsPackageOpen] = useState(false);
  const [expandedCves, setExpandedCves] = useState<Set<string>>(new Set());
  const pathname = useDecodedPathname();
  const router = useRouter();
  const vulnById = useMemo(
    () => new Map(row.original.vulns.map((v) => [v.id, v])),
    [row.original.vulns],
  );
  const vulnGroups = useMemo(
    () => groupBy(row.original.vulns, "cveID"),
    [row.original.vulns],
  );

  const toggleCve = (cveID: string) => {
    setExpandedCves((prev) => {
      const next = new Set(prev);
      if (next.has(cveID)) {
        next.delete(cveID);
      } else {
        next.add(cveID);
      }
      return next;
    });
  };

  return (
    <>
      {/* Package header row - clickable to expand/collapse */}
      <tr
        className={classNames(
          "cursor-pointer hover:bg-muted/50 border-b",
          index % 2 !== 0 && "bg-card/50",
        )}
        onClick={() => setIsPackageOpen((prev) => !prev)}
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            {isPackageOpen ? (
              <ChevronDownIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
            <EcosystemImage packageName={row.original.packageName} size={16} />
            <span className="font-medium truncate">
              {beautifyPurl(row.original.packageName)}
            </span>
            <span className="text-xs text-muted-foreground">
              {extractVersion(row.original.packageName)}
            </span>
          </div>
        </td>
        <td className="py-3 px-4 flex">
          <Severity risk={row.original.maxRisk} />
        </td>
        <td className="py-3 px-4">
          <span className="text-sm">
            {(row.original.maxCvss ?? 0).toFixed(1)}
          </span>
        </td>
        <td className="py-3 px-4">
          <Badge variant="outline" className="w-fit">
            {row.original.vulnCount}
          </Badge>
        </td>
      </tr>

      {isPackageOpen &&
        Object.entries(vulnGroups).map(([cveID, vulns]) => {
          const selectableIds = vulns
            .filter((v) => v.state !== "fixed")
            .map((v) => v.id);
          const allSelected =
            selectableIds.length > 0 &&
            selectableIds.every((id) => selectedVulnIds.has(id));
          const someSelected = selectableIds.some((id) =>
            selectedVulnIds.has(id),
          );
          const selectedIds = selectableIds.filter((id) =>
            selectedVulnIds.has(id),
          );

          const hasMultiplePaths = vulns.length > 1;
          const isCveExpanded = expandedCves.has(cveID);
          const sortedVulns = vulns.sort(
            (a, b) => b.rawRiskAssessment - a.rawRiskAssessment,
          );
          const isPathExplosion =
            sortedVulns[0]?.vulnerabilityPath?.length === 0;

          const pathExplosionOrOnlySinglePath =
            isPathExplosion || !hasMultiplePaths;

          const vulnDetailHref =
            pathname + "/../dependency-risks/" + sortedVulns[0]?.id;

          return (
            <React.Fragment key={cveID}>
              {/* CVE subheader */}
              <tr
                className="bg-muted/30 border-b border-gray-100 dark:border-white/5 hover:bg-muted/50 cursor-pointer"
                onClick={(e) => {
                  // Don't act if clicking on checkbox or button
                  if (
                    (e.target as HTMLElement).closest(
                      'button, input, [role="checkbox"]',
                    )
                  )
                    return;
                  if (pathExplosionOrOnlySinglePath) {
                    router.push(vulnDetailHref);
                  } else {
                    toggleCve(cveID);
                  }
                }}
              >
                <td className="py-3 px-4 pl-10">
                  <div className="flex flex-row items-center gap-3">
                    {!pathExplosionOrOnlySinglePath && (
                      <span className="p-0.5">
                        {isCveExpanded ? (
                          <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                        )}
                      </span>
                    )}
                    <Checkbox
                      className={pathExplosionOrOnlySinglePath ? "ml-8" : ""}
                      checked={
                        allSelected
                          ? true
                          : someSelected
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={() => onToggleAll(selectableIds)}
                      disabled={!hasSession}
                    />
                    <span className="font-medium text-foreground">{cveID}</span>

                    {isPathExplosion ? (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="text-xs gap-1">
                            <LinkBreak2Icon className="w-3 h-3" />
                            Path Explosion
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            This vulnerability has too many dependency paths to
                            display individually. Click the CVE ID to view
                            details and manage this vulnerability.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ) : vulns.length > 1 ? (
                      <Badge variant="outline" className="text-xs">
                        {vulns.length} path{vulns.length !== 1 ? "s" : ""}
                      </Badge>
                    ) : null}
                  </div>
                </td>
                <td className="py-2 px-4 flex">
                  <Severity risk={sortedVulns[0]?.rawRiskAssessment ?? 0} />
                </td>
                <td className="py-2 px-4">
                  <span className="text-sm">
                    {(sortedVulns[0]?.cve?.cvss ?? 0).toFixed(1)}
                  </span>
                </td>
                <td />
              </tr>

              {/* Individual vulnerability paths */}
              {/* Show only when CVE is expanded and not a path explosion */}
              {!isPathExplosion &&
                isCveExpanded &&
                sortedVulns.map((vuln) => (
                  <VulnWithCveTableRow
                    vuln={vuln}
                    key={vuln.id}
                    href={pathname + "/../dependency-risks/" + vuln.id}
                    selectable={vuln.state !== "fixed"}
                    selected={selectedVulnIds.has(vuln.id)}
                    onToggle={() => onToggleVuln(vuln.id)}
                    hasSession={hasSession}
                  />
                ))}
            </React.Fragment>
          );
        })}
    </>
  );
};

export default RiskHandlingRow;
