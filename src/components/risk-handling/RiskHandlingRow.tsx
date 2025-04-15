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

import { FlawByPackage, FlawWithCVE } from "@/types/api/api";
import { classNames } from "@/utils/common";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { flexRender, Row } from "@tanstack/react-table";
import React, { FunctionComponent } from "react";
import FlawState from "../common/FlawState";
import { useRouter } from "next/router";
import { Badge } from "../ui/badge";
import { defaultScanner } from "@/utils/view";

interface Props {
  row: Row<FlawByPackage>;
  index: number;
  arrLength: number;
}

const FlawWithCveTableRow = ({
  onClick,
  flaw,
}: {
  onClick: () => void;
  flaw: FlawWithCVE;
}) => {
  return (
    <tr
      onClick={onClick}
      className="border-b align-top hover:bg-gray-50 dark:hover:bg-secondary"
      key={flaw.id}
    >
      <td className="p-4">
        <div className="flex flex-row">
          <FlawState state={flaw.state} />
        </div>
      </td>
      <td className="p-4">
        <Badge variant={"secondary"}>
          {flaw.scanner.replace(defaultScanner, "")}
        </Badge>
      </td>
      <td className="p-4">{flaw.cveId}</td>
      <td className="p-4">
        {" "}
        <Badge variant={"secondary"}> {flaw.cve?.cvss}</Badge>
      </td>
      <td className="p-4">{flaw.rawRiskAssessment.toFixed(1)}</td>
      <td className="p-4">
        {flaw.componentFixedVersion ? (
          <span>
            <Badge variant={"secondary"}>{flaw.componentFixedVersion}</Badge>
          </span>
        ) : (
          <span className="text-muted-foreground">No fix available</span>
        )}
      </td>
      <td className="p-4" colSpan={2}>
        <div className="line-clamp-3">{flaw.cve?.description} </div>
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
  const router = useRouter();
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
        key={row.id}
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
                    <th className="w-32 p-4">State</th>
                    <th className="w-32 p-4">Scanner</th>
                    <th className="w-40 p-4">CVE</th>
                    <th className="w-40 p-4">CVSS</th>

                    <th className="w-20 p-4">Risk</th>
                    <th className="w-40 p-4">Fixed in Version</th>
                    <th className="w-full p-4">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {row.original.flaws?.map((flaw) => (
                    <FlawWithCveTableRow
                      flaw={flaw}
                      key={flaw.id}
                      onClick={() =>
                        router.push(
                          router.asPath.split("?")[0] + "/../flaws/" + flaw.id,
                        )
                      }
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
