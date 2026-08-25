// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { FunctionComponent } from "react";
import { useIsHydrated } from "@/hooks/useIsHydrated";

interface Props {
  date: Date;
}
const DateString: FunctionComponent<Props> = ({ date }) => {
  const isHydrated = useIsHydrated();

  return isHydrated ? date.toLocaleDateString() : date.toDateString();
};

export default DateString;

export const parseDateOnly = (dateString: string): Date => {
  return new Date(dateString.split(" ")[0]);
};
