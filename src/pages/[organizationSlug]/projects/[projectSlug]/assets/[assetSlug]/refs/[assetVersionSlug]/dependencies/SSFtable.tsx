// Copyright (C) 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
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

import { FlawByPackage, FlawWithCVE, ScoreCard } from "@/types/api/api";
import { classNames } from "@/utils/common";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { flexRender, Row } from "@tanstack/react-table";
import React, { FunctionComponent } from "react";
import FlawState from "../../../../../../../../../components/common/FlawState";
import { useRouter } from "next/router";
import { Badge } from "../../../../../../../../../components/ui/badge";
import { defaultScanner } from "@/utils/view";

interface Props {
  scoreCard?: ScoreCard;
}

const SSFTableRow = ({ scoreCard }: { scoreCard: ScoreCard }) => {
  return (
    <tr>
      {scoreCard?.checks.map((e) => (
        <tr key={e.name}>
          <td>{e.name}</td>
          <td>{e.score}</td>
          <td>{e.reason}</td>
          <td>{e.documentation.shortDescription}</td>
        </tr>
      ))}
    </tr>
  );
};

const OpenSSFtable: FunctionComponent<Props> = ({ scoreCard }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  return (
    <>
      <tr>
        <td>acorn</td>
        <td>2</td>
        <td>3</td>
      </tr>

      <tr onClick={() => setIsOpen((prev) => !prev)}>
        <td className="py-4 ">
          {isOpen ? (
            <ChevronDownIcon className="relative top-0.5 mx-auto w-4 text-muted-foreground" />
          ) : (
            <ChevronRightIcon className="relative top-0.5 mx-auto w-4 text-muted-foreground" />
          )}
        </td>
      </tr>
      {isOpen && (
        <tr>
          <td colSpan={7}>
            <div className="m-2 ml-12 overflow-hidden">
              <table className="w-full table-fixed">
                <td>{scoreCard && <SSFTableRow scoreCard={scoreCard} />}</td>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default OpenSSFtable;
