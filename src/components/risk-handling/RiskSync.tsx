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

import {
  DetailedDependencyVulnDTO,
  VulnByPackage,
  VulnDTO,
  VulnEventDTO,
  VulnWithCVE,
} from "@/types/api/api";
import { classNames } from "@/utils/common";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { flexRender, Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import React, { FunctionComponent } from "react";
import Link from "next/link";
import ArtifactBadge from "../ArtifactBadge";
import Severity from "../common/Severity";
import VulnState from "../common/VulnState";
import { Badge } from "../ui/badge";
import useDecodedPathname from "../../hooks/useDecodedPathname";
import { Switch } from "../ui/switch";

interface Props {
  row: Row<DetailedDependencyVulnDTO>;
  index: number;
  arrLength: number;
  vulnsToUpdate?: string[];
  setVulnsToUpdate?: React.Dispatch<React.SetStateAction<string[]>>;
}

const allowedStates: VulnDTO["state"][] = [
  "open",
  "fixed",
  "accepted",
  "falsePositive",
  "markedForTransfer",
];

const getState = (
  upstream: number,
  events: VulnEventDTO[],
): VulnDTO["state"] => {
  for (let i = events.length - 1; i >= 0; i--) {
    if (
      events[i].upstream === upstream &&
      allowedStates.includes(events[i].type as VulnDTO["state"])
    ) {
      return events[i].type as VulnDTO["state"];
    }
  }
  return "open";
};

const getJustification = (
  upstream: number,
  events: VulnEventDTO[],
): string | null => {
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].upstream === upstream && events[i].justification) {
      return events[i].justification;
    }
  }
  return null;
};

const VulnWithEvents = ({
  vuln,
  vulnsToUpdate,
  setVulnsToUpdate,
}: {
  vuln: DetailedDependencyVulnDTO;
  vulnsToUpdate?: string[];
  setVulnsToUpdate?: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  return (
    <tr
      className="border-b align-top hover:bg-gray-50 dark:hover:bg-accent"
      key={vuln.id}
    >
      <td className="p-4 relative">
        <div className="flex flex-row">
          <VulnState state={getState(2, vuln.events)} />
        </div>
      </td>

      <td className="p-4 relative">
        <div className="flex flex-row">
          <VulnState state={getState(1, vuln.events)} />
        </div>
      </td>

      <td className="p-4 relative">
        <div className="flex flex-row">{getJustification(1, vuln.events)}</div>
      </td>
      <td className="p-4 relative">
        <div className="flex flex-row">
          <Switch
            checked={vulnsToUpdate?.includes(vuln.id) ?? false}
            onCheckedChange={(checked) => {
              if (checked) {
                setVulnsToUpdate?.((prev) =>
                  prev?.includes(vuln.id) ? prev : [...prev, vuln.id],
                );
              } else {
                setVulnsToUpdate?.(
                  (prev) => prev?.filter((id) => id !== vuln.id) || [],
                );
              }
            }}
          />
        </div>
      </td>
    </tr>
  );
};

const RiskSync: FunctionComponent<Props> = ({
  row,
  index,
  arrLength,
  vulnsToUpdate,
  setVulnsToUpdate,
}) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const router = useRouter();
  const pathname = useDecodedPathname();

  console.log("Vulns to update:", (vulnsToUpdate ?? []).length);

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
        key={row.original.cveID}
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
          <td colSpan={7}>
            <div className="m-2 ml-12 overflow-hidden rounded-lg border">
              <table className="w-full table-fixed">
                <thead
                  className={classNames(
                    "w-full text-left",
                    index % 2 == 0 ? "bg-card" : "bg-background",
                  )}
                >
                  <tr className="">
                    <th className="w-32 p-4">Actual State</th>
                    <th className="w-32 p-4">Upstream State</th>
                    <th className="w-40 p-4">Upstream Justification</th>
                    <th className="w-40 p-4">Upstream State Sync</th>
                  </tr>
                </thead>
                <tbody>
                  <VulnWithEvents
                    vuln={row.original}
                    key={row.original.id}
                    vulnsToUpdate={vulnsToUpdate}
                    setVulnsToUpdate={setVulnsToUpdate}
                  />
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default RiskSync;
