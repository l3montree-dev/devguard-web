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
      return <ChevronUpIcon className="black h-4 w-4" />;
    case "desc":
      return <ChevronUpIcon className="black h-4 w-4 rotate-180 transform" />;
  }
};

export default SortingCaret;
