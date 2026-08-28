// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { VulnByPackage, VulnWithCVE } from "@/types/view/vuln";
import { classNames, stateLabels } from "@/utils/common";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import type { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import React, { type FunctionComponent, useMemo, useState } from "react";
import useDecodedPathname from "../../hooks/useDecodedPathname";
import { isMember, useCurrentUserRole } from "../../hooks/useUserRole";
import Severity, { CVSSBadge } from "../common/Severity";
import Purl from "../common/Purl";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Tooltip, TooltipContent } from "../ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { LinkBreak2Icon } from "@radix-ui/react-icons";
import { groupBy } from "lodash";
import Link from "next/link";
import { WrenchIcon } from "lucide-react";
import { isQuickfixAvailable } from "../Quickfix";
import WarningWithDescription from "../common/WarningWithDescription";
import type { TableFeatures } from "@/hooks/useTable";

interface Props {
  row: Row<TableFeatures, VulnByPackage>;
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
}

const SelectionCheckbox = ({
  checked,
  onToggle,
  disabled,
  className,
  ariaLabel,
}: {
  checked: boolean | "indeterminate";
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}) => (
  <div
    className={classNames(
      "relative flex size-4 shrink-0 items-center justify-center",
      className,
    )}
  >
    <Checkbox
      checked={checked}
      onCheckedChange={onToggle}
      disabled={disabled}
      aria-label={ariaLabel}
    />
    <span
      aria-hidden
      className={classNames(
        "absolute -inset-2",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
      )}
      onClick={(e) => {
        e.stopPropagation();
        if (disabled) return;
        onToggle();
      }}
    />
  </div>
);

const CvssCell = ({ cvss }: { cvss?: number | null }) => (
  <div className="flex">
    {cvss == null || cvss === -1 ? (
      <span className="text-sm">N/A</span>
    ) : (
      <CVSSBadge cvss={cvss} />
    )}
  </div>
);

const WrenchIndicator = ({ message }: { message: string }) => (
  <Tooltip>
    <TooltipTrigger className="flex" onClick={(e) => e.stopPropagation()}>
      <WrenchIcon className="h-4 w-4 text-muted-foreground" />
    </TooltipTrigger>
    <TooltipContent className="max-w-xs">{message}</TooltipContent>
  </Tooltip>
);

const QuickfixWrench = ({ vuln }: { vuln: VulnWithCVE }) => {
  if (!isQuickfixAvailable(vuln)) {
    return null;
  }
  return (
    <WrenchIndicator message="A quick fix is available: this vulnerability can be resolved by a direct dependency update. Consider prioritizing it as it can be resolved faster. Open the vulnerability to see the exact upgrade command." />
  );
};

const VulnWithCveTableRow = ({
  vuln,
  href,
  selectable,
  selected,
  onToggle,
}: {
  vuln: VulnWithCVE;
  href: string;
  selectable: boolean;
  selected: boolean;
  onToggle: () => void;
}) => {
  const isMemberRole = isMember(useCurrentUserRole());
  const router = useRouter();
  return (
    <tr
      className="border-b border-border hover:bg-muted/50 cursor-pointer"
      key={vuln.id}
      onClick={(e) => {
        // Don't navigate if clicking on checkbox
        if (
          (e.target as HTMLElement).closest(
            'a, button, input, [role="checkbox"]',
          )
        )
          return;
        router.push(href);
      }}
    >
      <td className="py-3 pl-[72px] pr-4">
        <div className="flex items-start gap-3">
          {selectable && (
            <SelectionCheckbox
              className="mt-0.5 ml-6"
              checked={selected}
              onToggle={onToggle}
              disabled={!isMemberRole}
              ariaLabel="Select vulnerability path"
            />
          )}
          <div className="flex-1 min-w-0">
            <Tooltip>
              <TooltipTrigger className="text-left">
                <Link href={href}>
                  <div className="text-sm text-foreground truncate max-w-md">
                    <span className="mr-2 text-xs text-muted-foreground">
                      {vuln.state !== "open" && (
                        <>{stateLabels[vuln.state] ?? vuln.state}, </>
                      )}
                      {vuln.vulnerabilityPath.length === 1
                        ? "Direct"
                        : `${vuln.vulnerabilityPath.length} hops`}
                    </span>
                    {vuln.vulnerabilityPath.length <= 2 ? (
                      <span>
                        {vuln.vulnerabilityPath.map((p, i) => (
                          <span key={i}>
                            {i > 0 && " → "}
                            <Purl
                              purl={p}
                              showIcon={false}
                              showVersion={false}
                              showQualifiers={false}
                            />
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span>
                        <Purl
                          purl={vuln.vulnerabilityPath[0]}
                          showIcon={false}
                          showVersion={false}
                          showQualifiers={false}
                        />
                        {" → ... → "}
                        <Purl
                          purl={
                            vuln.vulnerabilityPath[
                              vuln.vulnerabilityPath.length - 1
                            ]
                          }
                          showIcon={false}
                          showVersion={false}
                          showQualifiers={false}
                        />
                      </span>
                    )}
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex flex-wrap flex-row items-start gap-2 break-all max-w-md">
                  {vuln.vulnerabilityPath.map((el, i) => (
                    <span className="flex flex-row items-center gap-1" key={i}>
                      <Purl
                        purl={el}
                        showVersion={false}
                        showQualifiers={false}
                      />
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
          <Severity risk={vuln.riskAssessment} />
        </div>
      </td>
      <td className="py-3 px-4">
        <CvssCell cvss={vuln.cve?.cvss} />
      </td>
      <td className="py-3 px-4">
        <QuickfixWrench vuln={vuln} />
      </td>
    </tr>
  );
};

const RiskHandlingRow: FunctionComponent<Props> = ({
  row,
  index,
  selectedVulnIds,
  onToggleVuln,
  onToggleAll,
}) => {
  const isMemberRole = isMember(useCurrentUserRole());
  const [isPackageOpen, setIsPackageOpen] = useState(false);
  const [expandedCves, setExpandedCves] = useState<Set<string>>(new Set());
  const pathname = useDecodedPathname();
  const router = useRouter();
  const vulnGroups = useMemo(
    () => groupBy(row.original.vulns, "cveID"),
    [row.original.vulns],
  );
  const packageHasQuickfix = useMemo(
    () => row.original.vulns.some(isQuickfixAvailable),
    [row.original.vulns],
  );
  const isActivelyExploited = row.original.vulns.some(
    (v) => v.cve?.cisaExploitAdd || v.cve?.euvdExploitAdd,
  );

  const packageSelectableIds = useMemo(
    () =>
      row.original.vulns.filter((v) => v.state !== "fixed").map((v) => v.id),
    [row.original.vulns],
  );
  const showPackageSelectAll = packageSelectableIds.length > 0;
  const allPackageSelected =
    packageSelectableIds.length > 0 &&
    packageSelectableIds.every((id) => selectedVulnIds.has(id));
  const somePackageSelected = packageSelectableIds.some((id) =>
    selectedVulnIds.has(id),
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
        data-testid="package-row"
        className={classNames(
          "cursor-pointer hover:bg-muted/50 border-b",
          index % 2 !== 0 && "bg-card/50",
        )}
        onClick={() => setIsPackageOpen((prev) => !prev)}
      >
        <td className="py-3 px-4">
          <div className="flex min-w-0 items-center gap-2">
            {isPackageOpen ? (
              <ChevronDownIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
            {showPackageSelectAll ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex">
                    <SelectionCheckbox
                      checked={
                        allPackageSelected
                          ? true
                          : somePackageSelected
                            ? "indeterminate"
                            : false
                      }
                      onToggle={() => onToggleAll(packageSelectableIds)}
                      disabled={!isMemberRole}
                      ariaLabel={`Select all vulnerabilities of ${row.original.packageName}`}
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Select {packageSelectableIds.length === 1 ? "" : "all"}{" "}
                  {packageSelectableIds.length} vulnerabilit
                  {packageSelectableIds.length === 1 ? "y" : "ies"} of this
                  package
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="size-4 shrink-0" />
            )}
            <Purl purl={row.original.packageName} />
            {isActivelyExploited ? (
              <WarningWithDescription
                description={
                  <>
                    <span className="font-bold">
                      A vulnerability in this package is actively exploited!
                    </span>
                    <br />
                    Present in official KEV catalogue. See the details page for
                    more information.
                  </>
                }
              />
            ) : null}
          </div>
        </td>
        <td className="py-3 px-4 flex">
          <Severity risk={row.original.maxRisk} />
        </td>
        <td className="py-3 px-4">
          <CvssCell cvss={row.original.maxCvss} />
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="w-fit">
              {row.original.vulnCount}
            </Badge>
            {packageHasQuickfix && (
              <WrenchIndicator message="A quick fix is available for at least one vulnerability in this package. Expand it to see the affected dependency and the exact upgrade command." />
            )}
          </div>
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
          const hasMultiplePaths = vulns.length > 1;
          const isCveExpanded = expandedCves.has(cveID);
          const sortedVulns = vulns.sort(
            (a, b) => b.riskAssessment - a.riskAssessment,
          );
          const isPathExplosion =
            sortedVulns[0]?.vulnerabilityPath?.length === 0;

          const pathExplosionOrOnlySinglePath =
            isPathExplosion || !hasMultiplePaths;

          const cveHasQuickfix = vulns.some(isQuickfixAvailable);

          const vulnDetailHref =
            pathname + "/../dependency-risks/" + sortedVulns[0]?.id;

          return (
            <React.Fragment key={cveID}>
              {/* CVE subheader */}
              <tr
                data-testid="cve-row"
                className="bg-muted/30 border-b border-border hover:bg-muted/50 cursor-pointer"
                onClick={(e) => {
                  // Don't act if clicking on checkbox or button
                  if (
                    (e.target as HTMLElement).closest(
                      'a, button, input, [role="checkbox"]',
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
                      <button
                        className="p-0.5 hover:bg-muted rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCve(cveID);
                        }}
                        aria-label={
                          isCveExpanded
                            ? `Collapse ${cveID} paths`
                            : `Expand ${cveID} paths`
                        }
                        aria-expanded={isCveExpanded}
                      >
                        {isCveExpanded ? (
                          <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    )}
                    <SelectionCheckbox
                      className={pathExplosionOrOnlySinglePath ? "ml-8" : ""}
                      checked={
                        allSelected
                          ? true
                          : someSelected
                            ? "indeterminate"
                            : false
                      }
                      onToggle={() => onToggleAll(selectableIds)}
                      disabled={!isMemberRole}
                      ariaLabel={`Select all paths of ${cveID}`}
                    />
                    {pathExplosionOrOnlySinglePath ? (
                      <Link
                        href={vulnDetailHref}
                        className="font-medium !text-foreground hover:underline"
                      >
                        {cveID}
                      </Link>
                    ) : (
                      <span className="font-medium text-foreground">
                        {cveID}
                      </span>
                    )}
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
                    {sortedVulns[0]?.cve?.cisaExploitAdd ||
                    sortedVulns[0]?.cve?.euvdExploitAdd ? (
                      <WarningWithDescription
                        description={
                          <>
                            <span className="font-bold">
                              This vulnerability is known to be actively
                              exploited!
                            </span>
                            <br />
                            Present in official KEV catalogue. See the details
                            page for more information.
                          </>
                        }
                      />
                    ) : null}
                  </div>
                </td>
                <td className="py-2 px-4 flex">
                  <Severity risk={sortedVulns[0]?.riskAssessment ?? 0} />
                </td>
                <td className="py-2 px-4">
                  <CvssCell cvss={sortedVulns[0]?.cve?.cvss} />
                </td>
                <td className="py-2 px-4">
                  {cveHasQuickfix && (
                    <WrenchIndicator
                      message={
                        pathExplosionOrOnlySinglePath
                          ? "A quick fix is available for this vulnerability. Open it to see the exact upgrade command."
                          : "A quick fix is available for one of this vulnerability's dependency paths. Expand it to find the affected path and the upgrade command."
                      }
                    />
                  )}
                </td>
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
                  />
                ))}
            </React.Fragment>
          );
        })}
    </>
  );
};

export default RiskHandlingRow;
