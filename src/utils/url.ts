import { GetServerSidePropsContext } from "next";

export const buildFilterQuery = (context: GetServerSidePropsContext) => {
  const filterQuery = Object.fromEntries(
    Object.entries(context.query).filter(
      ([k]) => k.startsWith("filterQuery[") || k.startsWith("sort["),
    ),
  );

  return filterQuery;
};

export const buildFilterSearchParams = (context: GetServerSidePropsContext) => {
  const page = (context.query.page || "1") as string;
  const pageSize = (context.query.pageSize || "25") as string;

  const filterQuery = buildFilterQuery(context);

  return new URLSearchParams({
    page,
    pageSize,
    ...(context.query.search ? { search: context.query.search as string } : {}),
    ...filterQuery,
  });
};

export function urlToBaseURL(url: string): string {
  const regex = /^(https?:\/\/[^\/]+)/i; //regex rule https://regex101.com/r/n3xN3y/1
  const formatedUrl = url.split(regex);

  return formatedUrl[1];
}
