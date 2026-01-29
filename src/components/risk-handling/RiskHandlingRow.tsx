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
import { removeUnderscores, vexOptionMessages } from "@/utils/view";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Row } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { FunctionComponent, useMemo, useState } from "react";
import useDecodedPathname from "../../hooks/useDecodedPathname";
import ArtifactBadge from "../ArtifactBadge";
import MarkdownEditor from "../common/MarkdownEditor";
import Severity from "../common/Severity";
import VulnState from "../common/VulnState";
import { Badge } from "../ui/badge";
import { AsyncButton, Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent } from "../ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import EcosystemImage from "../common/EcosystemImage";
import { groupBy } from "lodash";
import Image from "next/image";
import { useTheme } from "next-themes";
import { ChevronDown } from "lucide-react";
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
}

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
            <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
              <Checkbox checked={selected} onCheckedChange={onToggle} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {vuln.state !== "open" && (
              <div className="flex mb-3 items-center gap-2 text-sm text-muted-foreground">
                <span>State:</span>
                <VulnState state={vuln.state} />
              </div>
            )}
            <Tooltip>
              <TooltipTrigger className="text-left">
                <div className="text-sm text-foreground truncate max-w-md">
                  <span className="font-medium text-muted-foreground">
                    Path:{" "}
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

                  <span className="ml-2 text-xs text-muted-foreground">
                    {vuln.vulnerabilityPath.length === 1
                      ? "Direct"
                      : `${vuln.vulnerabilityPath.length} hops`}
                  </span>
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
            <div className="flex items-center gap-2 mt-1 flex-wrap text-muted-foreground">
              In Artifact:
              <div className="flex items-center gap-2 flex-wrap">
                {vuln.artifacts.map((artifact) => (
                  <ArtifactBadge
                    key={vuln.id + artifact.artifactName}
                    artifactName={artifact.artifactName}
                  />
                ))}
              </div>
            </div>
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
  arrLength,
  selectedVulnIds,
  onToggleVuln,
  onToggleAll,
  onBulkAction,
}) => {
  const [isPackageOpen, setIsPackageOpen] = useState(false);
  const [expandedCves, setExpandedCves] = useState<Set<string>>(new Set());
  const pathname = useDecodedPathname();
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

  // bulk action dialog state
  const [acceptDialogVulnIds, setAcceptDialogVulnIds] = useState<
    string[] | null
  >(null);
  const [falsePositiveDialogVulnIds, setFalsePositiveDialogVulnIds] = useState<
    string[] | null
  >(null);
  const [justification, setJustification] = useState("");
  const [selectedVexOption, setSelectedVexOption] = useState(
    "component_not_present",
  );

  const { theme } = useTheme();

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
          const selectedOpenIds = selectedIds.filter((id) => {
            const state = vulnById.get(id)?.state;
            return state === "open";
          });
          const selectedClosedIds = selectedIds.filter((id) => {
            const state = vulnById.get(id)?.state;
            return state === "accepted" || state === "falsePositive";
          });

          const hasMultiplePaths = vulns.length > 1;
          const isCveExpanded = expandedCves.has(cveID);
          const sortedVulns = vulns.sort(
            (a, b) => b.rawRiskAssessment - a.rawRiskAssessment,
          );

          return (
            <React.Fragment key={cveID}>
              {/* CVE subheader */}
              <tr className="bg-muted/30 border-b border-gray-100 dark:border-white/5">
                <td className="py-3 px-4 pl-10">
                  <div className="flex flex-row items-center gap-3">
                    <button
                      onClick={() => toggleCve(cveID)}
                      className="p-0.5 hover:bg-muted rounded"
                    >
                      {isCveExpanded ? (
                        <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    {selectableIds.length > 0 && (
                      <Checkbox
                        checked={
                          allSelected
                            ? true
                            : someSelected
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={() => onToggleAll(selectableIds)}
                      />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCve(cveID);
                      }}
                      className="font-medium text-foreground hover:underline cursor-pointer"
                    >
                      {cveID}
                    </button>
                    <Link
                      target="_blank"
                      href={"https://osv.dev/vulnerability/" + cveID}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:opacity-80"
                    >
                      <Image
                        src={
                          theme === "light"
                            ? "/logos/osv-black.png"
                            : "/logos/osv.png"
                        }
                        alt="OSV Logo"
                        width={20}
                        height={20}
                        className="opacity-50 hover:opacity-100 transition-opacity"
                      />
                    </Link>
                    <Badge variant="outline" className="text-xs">
                      {vulns.length} path{vulns.length !== 1 ? "s" : ""}
                    </Badge>
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
                <td className="py-2 px-4">
                  <div className="flex flex-row items-center  gap-1.5">
                    {selectedClosedIds.length > 0 && (
                      <Button
                        size="xs"
                        variant="secondary"
                        className={classNames(
                          "transition-opacity",
                          selectedClosedIds.length > 0 && someSelected
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none",
                        )}
                        onClick={async () => {
                          await onBulkAction({
                            vulnIds: selectedClosedIds,
                            status: "reopened",
                            justification: "",
                          });
                          toast("Reopened", {
                            description: `${selectedClosedIds.length} vulnerability path${selectedClosedIds.length !== 1 ? "s" : ""} reopened.`,
                          });
                        }}
                      >
                        Reopen
                      </Button>
                    )}
                    {selectedOpenIds.length > 0 && (
                      <>
                        <Button
                          size="xs"
                          variant="secondary"
                          className={classNames(
                            "transition-opacity",
                            selectedOpenIds.length > 0 && someSelected
                              ? "opacity-100"
                              : "opacity-0 pointer-events-none",
                          )}
                          onClick={() => {
                            setJustification("");
                            setFalsePositiveDialogVulnIds(selectedOpenIds);
                          }}
                        >
                          False positive
                        </Button>
                        <Button
                          size="xs"
                          variant="secondary"
                          className={classNames(
                            "transition-opacity",
                            selectedOpenIds.length > 0 && someSelected
                              ? "opacity-100"
                              : "opacity-0 pointer-events-none",
                          )}
                          onClick={() => {
                            setJustification("");
                            setAcceptDialogVulnIds(selectedOpenIds);
                          }}
                        >
                          Accept risk
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>

              {/* Individual vulnerability paths */}
              {/* Show only when CVE is expanded */}
              {isCveExpanded &&
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

      {/* Accept Risk Dialog */}
      <Dialog
        open={acceptDialogVulnIds !== null}
        onOpenChange={(open) => {
          if (!open) setAcceptDialogVulnIds(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Risk</DialogTitle>
            <DialogDescription>
              You are about to accept the risk for{" "}
              {acceptDialogVulnIds?.length ?? 0} selected vulnerability path
              {(acceptDialogVulnIds?.length ?? 0) !== 1 ? "s" : ""}. This
              acknowledges you are aware of the vulnerability and its potential
              impact.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <label className="block text-sm font-semibold">Justification</label>
            <MarkdownEditor
              className="!bg-card"
              placeholder="Why are you accepting this risk?"
              value={justification}
              setValue={(v) => setJustification(v ?? "")}
            />
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setAcceptDialogVulnIds(null)}
              >
                Cancel
              </Button>
              <AsyncButton
                onClick={async () => {
                  if (!acceptDialogVulnIds) return;
                  const count = acceptDialogVulnIds.length;
                  await onBulkAction({
                    vulnIds: acceptDialogVulnIds,
                    status: "accepted",
                    justification,
                  });
                  setAcceptDialogVulnIds(null);
                  toast("Risk Accepted", {
                    description: `${count} vulnerability path${count !== 1 ? "s" : ""} accepted.`,
                  });
                }}
              >
                Accept Risk
              </AsyncButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* False Positive Dialog */}
      <Dialog
        open={falsePositiveDialogVulnIds !== null}
        onOpenChange={(open) => {
          if (!open) setFalsePositiveDialogVulnIds(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as False Positive</DialogTitle>
            <DialogDescription>
              You are about to mark {falsePositiveDialogVulnIds?.length ?? 0}{" "}
              selected vulnerability path
              {(falsePositiveDialogVulnIds?.length ?? 0) !== 1 ? "s" : ""} as
              false positive.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <label className="block text-sm font-semibold">Justification</label>
            <MarkdownEditor
              className="!bg-card"
              placeholder="Why is this a false positive?"
              value={justification}
              setValue={(v) => setJustification(v ?? "")}
            />
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setFalsePositiveDialogVulnIds(null)}
              >
                Cancel
              </Button>
              <div className="flex flex-row items-center">
                <AsyncButton
                  onClick={async () => {
                    if (!falsePositiveDialogVulnIds) return;
                    const count = falsePositiveDialogVulnIds.length;
                    await onBulkAction({
                      vulnIds: falsePositiveDialogVulnIds,
                      status: "falsePositive",
                      justification,
                      mechanicalJustification: selectedVexOption,
                    });
                    setFalsePositiveDialogVulnIds(null);
                    toast("Marked as False Positive", {
                      description: `${count} vulnerability path${count !== 1 ? "s" : ""} marked as false positive.`,
                    });
                  }}
                  variant="default"
                  className="rounded-r-none pr-0 capitalize"
                >
                  {removeUnderscores(selectedVexOption)}
                </AsyncButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="default"
                      className="rounded-l-none pl-1 pr-2"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {Object.entries(vexOptionMessages).map(
                      ([option, description]) => (
                        <DropdownMenuItem
                          key={option}
                          onClick={() => setSelectedVexOption(option)}
                        >
                          <div className="flex flex-col">
                            <span className="capitalize">
                              {removeUnderscores(option)}
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RiskHandlingRow;
