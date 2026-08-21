// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import {
  ChevronUpIcon,
  ArrowsUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { Arrow } from "@radix-ui/react-tooltip";
import React, { type FunctionComponent } from "react";

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
