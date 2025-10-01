import { ReadonlyURLSearchParams } from "next/navigation";

export const buildFilterQuery = (params: ReadonlyURLSearchParams) => {
  const filterQuery = Object.fromEntries(
    Object.entries(params).filter(
      ([k]) => k.startsWith("filterQuery[") || k.startsWith("sort["),
    ),
  );

  return filterQuery;
};

export const buildFilterSearchParams = (
  params: ReadonlyURLSearchParams | null,
) => {
  if (!params) return new URLSearchParams({ page: "1", pageSize: "25" });

  const page = params.get("page") || "1";
  const pageSize = params.get("pageSize") || "25";

  const filterQuery = buildFilterQuery(params);

  return new URLSearchParams({
    page,
    pageSize,
    ...(params.has("search") ? { search: params.get("search") as string } : {}),
    ...filterQuery,
  });
};

export function urlToBaseURL(url: string): string {
  const regex = /^(https?:\/\/[^\/]+)/i; //regex rule https://regex101.com/r/n3xN3y/1
  const formatedUrl = url.split(regex);

  return formatedUrl[1];
}
