import {
  ChevronUpIcon,
  ArrowsUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { Arrow } from "@radix-ui/react-tooltip";
import React, { FunctionComponent } from "react";

interface Props {
  sortDirection: "asc" | "desc" | false;
}

const SortingCaret: FunctionComponent<Props> = ({ sortDirection }) => {
  switch (sortDirection) {
    case false:
      return <ArrowsUpDownIcon className="black h-4 w-4 opacity-30" />;
    case "asc":
      return <ArrowUpIcon className="black h-4 w-4" />;
    case "desc":
      return <ArrowDownIcon className="black h-4 w-4" />;
  }
};

export default SortingCaret;
