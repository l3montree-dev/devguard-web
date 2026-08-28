// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { ColumnSort } from "@tanstack/react-table";

import type { FilterForm } from "@/types/view/filter";

export const sortingState2Query = (sortingState: ColumnSort[]) => {
  const query: Record<string, string> = {};

  sortingState.forEach((s) => {
    query["sort[" + s.id + "]"] = s.desc ? "desc" : "asc";
  });

  return query;
};

export const filterForm2Query = (form: FilterForm) => {
  const key = "filterQuery[" + form.field + "][" + form.operator + "]";

  if (form.operator === "like" || form.operator === "ilike") {
    return {
      [key]: "%" + form.value + "%",
    };
  }

  return {
    [key]: form.value,
  };
};
