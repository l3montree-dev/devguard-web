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
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { flexRender, Row } from "@tanstack/react-table";
import Link from "next/link";
import React, { FunctionComponent } from "react";
import useDecodedPathname from "../../hooks/useDecodedPathname";
import ArtifactBadge from "../ArtifactBadge";
import Severity from "../common/Severity";
import VulnState from "../common/VulnState";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent } from "../ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import EcosystemImage from "../common/EcosystemImage";

interface Props {
  row: Row<VulnByPackage>;
  index: number;
  arrLength: number;
}

const VulnWithCveTableRow = ({
  vuln,
  href,
}: {
  vuln: VulnWithCVE;
  href: string;
}) => {
  return (
    <tr
      className="border-b align-top hover:bg-gray-50 dark:hover:bg-accent"
      key={vuln.id}
    >
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
      <td className="p-4 relative">
        <Link href={href} className="absolute inset-0" />
        <Badge variant={"outline"}>{vuln.cveID}</Badge>
      </td>
      <td className="p-4 text-sm line-clamp-1 overflow-hidden text-overflow-ellipsis relative">
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
              {vuln.vulnerabilityPath.length >= 2 && (
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
      <td className="p-4  relative">
        <Link href={href} className="absolute inset-0" />
        <div className="flex flex-row">
          <Severity risk={vuln.rawRiskAssessment} />
        </div>
      </td>
      <td className="p-4  relative">
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
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = useDecodedPathname();
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
            <div className="m-2 ml-12 overflow-hidden rounded-lg border">
              <table className="w-full table-fixed">
                <thead
                  className={classNames(
                    "w-full text-left",
                    index % 2 == 0 ? "bg-card" : "bg-background",
                  )}
                >
                  <tr className="">
                    <th className="p-4">State</th>
                    <th className="p-4">Artifact</th>
                    <th className="p-4">Vulnerability</th>
                    <th className="p-4 w-92">Path</th>
                    <th className="p-4">Risk</th>
                    <th className="p-4">CVSS</th>
                  </tr>
                </thead>
                <tbody>
                  {row.original.vulns
                    ?.sort((a, b) => b.rawRiskAssessment - a.rawRiskAssessment)
                    .map((vuln) => (
                      <VulnWithCveTableRow
                        vuln={vuln}
                        key={vuln.id}
                        href={pathname + "/../dependency-risks/" + vuln.id}
                      />
                    ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default RiskHandlingRow;
