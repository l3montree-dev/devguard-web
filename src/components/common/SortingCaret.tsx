import { ChevronUpIcon } from "@heroicons/react/24/outline";
import React, { FunctionComponent } from "react";

interface Props {
  sortDirection: "asc" | "desc" | false;
}

const SortingCaret: FunctionComponent<Props> = ({ sortDirection }) => {
  switch (sortDirection) {
    case false:
      return null;
    case "asc":
      return <ChevronUpIcon className="w-4 h-4 black" />;
    case "desc":
      return <ChevronUpIcon className="w-4 h-4 black transform rotate-180" />;
  }
};

export default SortingCaret;
