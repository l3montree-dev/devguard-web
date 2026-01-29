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
import { beautifyPurl, classNames } from "@/utils/common";
import { removeUnderscores, vexOptionMessages } from "@/utils/view";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { flexRender, Row } from "@tanstack/react-table";
import Link from "next/link";
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
  return (
    <tr
      className="border-b align-top hover:bg-gray-50 dark:hover:bg-accent"
      key={vuln.id}
    >
      <td className="p-4 flex flex-row items-center justify-center relative">
        <div className="mt-1 ml-2">
          {selectable && (
            <Checkbox checked={selected} onCheckedChange={onToggle} />
          )}
        </div>
      </td>
      <td className="p-4 relative">
        <Link href={href} className="absolute inset-0" />
        <div className="flex flex-row">
          <VulnState state={vuln.state} />
        </div>
      </td>
      <td className="p-4 relative">
        <Link href={href} className="absolute inset-0 z-0" />
        <div className="relative z-10">
          {vuln.artifacts.map((artifact) => (
            <ArtifactBadge
              key={vuln.id + artifact.artifactName}
              artifactName={artifact.artifactName}
            />
          ))}
        </div>
      </td>

      <td className="p-4 text-sm overflow-hidden text-overflow-ellipsis relative">
        <Link href={href} className="absolute inset-0" />
        <Tooltip>
          <TooltipTrigger className="w-full">
            <div className="flex flex-row flex-wrap gap-2">
              {vuln.vulnerabilityPath.length === 1 && (
                <Badge variant={"outline"}>
                  <div className="flex flex-row items-center gap-1">
                    <span className="line-clamp-1">
                      {beautifyPurl(vuln.vulnerabilityPath[0])}
                    </span>
                  </div>
                </Badge>
              )}
              {vuln.vulnerabilityPath.length === 2 && (
                <div className="overflow-hidden text-ellipsis flex flex-wrap text-left flex-row gap-1">
                  <Badge variant={"outline"}>
                    <div className="flex flex-row items-center gap-1">
                      <span className="line-clamp-1">
                        {beautifyPurl(vuln.vulnerabilityPath[0])}
                      </span>
                    </div>
                  </Badge>
                  →{" "}
                  <Badge variant={"outline"}>
                    <div className="flex flex-row items-center gap-1">
                      <span className="line-clamp-1">
                        {beautifyPurl(vuln.vulnerabilityPath[1])}
                      </span>
                    </div>
                  </Badge>
                </div>
              )}
              {vuln.vulnerabilityPath.length > 2 && (
                <div className="overflow-hidden text-ellipsis flex flex-wrap text-left flex-row gap-1">
                  <Badge variant={"outline"}>
                    <div className="flex flex-row items-center gap-1">
                      <span className="line-clamp-1">
                        {beautifyPurl(vuln.vulnerabilityPath[0])}
                      </span>
                    </div>
                  </Badge>
                  → ... →{" "}
                  <Badge variant={"outline"}>
                    <div className="flex flex-row items-center gap-1">
                      <span className="line-clamp-1">
                        {beautifyPurl(
                          vuln.vulnerabilityPath[
                            vuln.vulnerabilityPath.length - 1
                          ],
                        )}
                      </span>
                    </div>
                  </Badge>
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex flex-wrap flex-row items-start gap-2 break-all">
              {vuln.vulnerabilityPath.map((el, i) => (
                <span
                  className="flex flex-row items-center text-ellipsis whitespace-nowrap gap-1"
                  key={i}
                >
                  <div>
                    <EcosystemImage size={12} packageName={el} />
                  </div>
                  {beautifyPurl(el)}
                  {i < vuln.vulnerabilityPath.length - 1 ? " → " : null}
                </span>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </td>
      <td className="p-4 relative">
        <Badge variant="outline">{vuln.vulnerabilityPath.length}</Badge>
      </td>
      <td className="p-4  relative">
        <Link href={href} className="absolute inset-0" />
        <div className="flex flex-row">
          <Severity risk={vuln.rawRiskAssessment} />
        </div>
      </td>
      <td className="p-4 relative">
        <Link href={href} className="absolute inset-0" />
        <div className="flex flex-row justify-start">
          <Severity gray risk={vuln.cve?.cvss ?? 0} />
        </div>
      </td>
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
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = useDecodedPathname();
  const vulnById = useMemo(
    () => new Map(row.original.vulns.map((v) => [v.id, v])),
    [row.original.vulns],
  );
  const vulnGroups = useMemo(
    () => groupBy(row.original.vulns, "cveID"),
    [row.original.vulns],
  );

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
      <tr
        onClick={() => setIsOpen((prev) => !prev)}
        className={classNames(
          "relative cursor-pointer align-top transition-all",
          index === arrLength - 1 || isOpen ? "" : "border-b",
          index % 2 != 0 && "bg-card/50",
          "hover:bg-gray-50 dark:hover:bg-card",
        )}
        key={row.original.packageName}
      >
        <td className="py-4 text-center align-baseline">
          {isOpen ? (
            <ChevronDownIcon className="relative top-0.5 mx-auto w-4 text-muted-foreground" />
          ) : (
            <ChevronRightIcon className="relative top-0.5 mx-auto w-4 text-muted-foreground" />
          )}
        </td>
        {row.getVisibleCells().map((cell, i) => (
          <td className="p-4" key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>
      {isOpen && (
        <tr
          className={classNames(
            "relative cursor-pointer bg-background align-top transition-all",
            index === arrLength - 1 ? "" : "border-b",
            index % 2 != 0 && "bg-card/50",
          )}
        >
          <td colSpan={6}>
            <div className="flex flex-col gap-4">
              {Object.entries(vulnGroups).map(([cveID, vulns]) => {
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

                return (
                  <div
                    key={cveID}
                    className="ml-6 my-2 mr-4 overflow-hidden rounded-lg border"
                  >
                    <div className="px-4 bg-card flex flex-row justify-between items-center gap-2 py-3 border-b">
                      <Link
                        target="_blank"
                        href={"https://osv.dev/vulnerability/" + cveID}
                        className="font-semibold !text-foreground text-lg"
                      >
                        {cveID}{" "}
                        <Image
                          src={
                            theme === "light"
                              ? "/logos/osv-black.png"
                              : "/logos/osv.png"
                          }
                          alt="OSV Logo"
                          width={40}
                          height={40}
                          className="inline-block ml-2 mb-1"
                        />
                      </Link>
                      <div
                        className={classNames(
                          "flex flex-row items-center gap-2 transition-all",
                          someSelected ? "opacity-100" : "opacity-0",
                        )}
                      >
                        {selectedClosedIds.length > 0 && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <AsyncButton
                              variant={"secondary"}
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
                              Reopen selected
                            </AsyncButton>
                          </div>
                        )}
                        {selectedOpenIds.length > 0 && (
                          <>
                            <Button
                              variant={"secondary"}
                              onClick={(e) => {
                                e.stopPropagation();
                                setJustification("");
                                setFalsePositiveDialogVulnIds(selectedOpenIds);
                              }}
                            >
                              Mark selected as false positive
                            </Button>
                            <Button
                              variant={"secondary"}
                              onClick={(e) => {
                                e.stopPropagation();
                                setJustification("");
                                setAcceptDialogVulnIds(selectedOpenIds);
                              }}
                            >
                              Accept selected risk
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <table className="w-full table-fixed">
                      <thead className="w-full text-left bg-accent/50">
                        <tr className="">
                          <th className="w-10">
                            {selectableIds.length > 0 && (
                              <div className="flex flex-row items-center justify-center ml-2">
                                <Checkbox
                                  checked={
                                    allSelected
                                      ? true
                                      : someSelected
                                        ? "indeterminate"
                                        : false
                                  }
                                  onCheckedChange={() =>
                                    onToggleAll(selectableIds)
                                  }
                                />
                              </div>
                            )}
                          </th>
                          <th className="p-4 w-36">State</th>
                          <th className="p-4 w-60">Artifact</th>
                          <th className="p-4">Path to vulnerable component</th>
                          <th className="p-4 w-30">Path length</th>
                          <th className="p-4 w-30">Risk</th>
                          <th className="p-4 w-34">CVSS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vulns
                          .sort(
                            (a, b) => b.rawRiskAssessment - a.rawRiskAssessment,
                          )
                          .map((vuln) => (
                            <VulnWithCveTableRow
                              vuln={vuln}
                              key={vuln.id}
                              href={
                                pathname + "/../dependency-risks/" + vuln.id
                              }
                              selectable={vuln.state !== "fixed"}
                              selected={selectedVulnIds.has(vuln.id)}
                              onToggle={() => onToggleVuln(vuln.id)}
                            />
                          ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </td>
        </tr>
      )}

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
