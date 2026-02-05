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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScoreCard } from "@/types/api/api";
import { classNames } from "@/utils/common";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import React, { FunctionComponent } from "react";
import OpenSsfScore from "./common/OpenSsfScore";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

interface Props {
  scoreCard?: ScoreCard;
}

// const words = ["spray", "elite", "exuberant", "destruction", "present"];

// function isGood({scoreCard}: {scoreCard: ScoreCard}) {
//    const goodOnes = scoreCard?.checks.map((e,i,arr) => (e.score) > 5)
//    goodOnes.filter((e) => e >= 5 );
// }

const SSFTableRow = ({ scoreCard }: { scoreCard: ScoreCard }) => {
  return (
    <>
      {scoreCard?.checks.map((e, i, arr) => (
        <div
          className={classNames(
            "text-sm flex flex-row items-center justify-between",

            i + 1 !== arr.length ? "border-b" : "",
          )}
          key={e.name}
        >
          <div className="text-left">
            <Tooltip>
              <TooltipTrigger className="text-left">
                {e.name}
                <InformationCircleIcon className="ml-1 inline-block h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{e.documentation.shortDescription}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="py-2 text-left">
            <Tooltip>
              <TooltipTrigger className="text-left">
                <OpenSsfScore score={e.score} />
              </TooltipTrigger>
              <TooltipContent>
                <p>{e.reason}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      ))}
    </>
  );
};

const OpenSsfDetails: FunctionComponent<Props> = ({ scoreCard }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex text-secondary-foreground cursor-pointer w-full pb-2 flex-row font-medium justify-between">
        More Details{" "}
        {isOpen ? (
          <ChevronDownIcon className="relative w-4 text-muted-foreground" />
        ) : (
          <ChevronRightIcon className="relative w-4 text-muted-foreground" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        {scoreCard && <SSFTableRow scoreCard={scoreCard} />}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default OpenSsfDetails;
