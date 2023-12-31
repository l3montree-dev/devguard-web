import { ColumnSort } from "@tanstack/react-table";
import { ParsedUrlQuery } from "querystring";

export interface FilterableColumnDef {
  operators: string[];
  filterValues?: string[];
  accessorKey: string;
  header: string;
}

export interface FilterForm {
  field: string;
  operator: string;
  value: string;
}

export const numberOperators = [
  "is",
  "is not",
  "is greater than",
  "is less than",
];

export const stringOperators = ["is", "is not"];
export const dateOperators = ["is", "is not", "is after", "is before"];

export const sortingState2Query = (sortingState: ColumnSort[]) => {
  const query: Record<string, string> = {};

  sortingState.forEach((s) => {
    query["sort[" + s.id + "]"] = s.desc ? "desc" : "asc";
  });

  return query;
};

export const query2SortingState = (query: ParsedUrlQuery): ColumnSort[] => {
  const keys = Object.keys(query).filter((k) => k.startsWith("sort["));

  if (keys.length === 0) {
    return [];
  }

  return keys.map((k) => {
    const [, id] = k.match(/sort\[(.*)\]/) as RegExpMatchArray;

    return {
      id,
      desc: query[k] === "desc",
    };
  });
};

export const filterForm2Query = (form: FilterForm) => {
  const key = "filterQuery[" + form.field + "][" + form.operator + "]";
  return {
    [key]: form.value,
  };
};

export const query2FilterFormEntry = (query: any, key: string): FilterForm => {
  const [, field, operator] = key.match(
    /filterQuery\[(.*)\]\[(.*)\]/,
  ) as RegExpMatchArray;

  return {
    field,
    operator,
    value: query[key],
  };
};

export const query2FilterForm = (query: ParsedUrlQuery): Array<FilterForm> => {
  const keys = Object.keys(query).filter((k) => k.startsWith("filterQuery["));

  if (keys.length === 0) {
    return [];
  }

  return keys.map((k) => query2FilterFormEntry(query, k));
};
