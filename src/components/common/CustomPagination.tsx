import { Paged } from "@/types/api/api";
import React, { FunctionComponent, useMemo } from "react";

import { useRouter } from "next/router";
import { Button } from "../ui/button";

interface Props extends Paged<any> {}
const CustomPagination: FunctionComponent<Props> = ({
  page,
  pageSize,
  total,
}) => {
  // calculate the amount of pages
  const pages = Math.ceil(total / pageSize);
  const router = useRouter();

  const navigateToPage = (page: number) => {
    router.push({
      query: { ...router.query, page },
    });
  };
  // check how many to the left and right of the current page
  const renderFirstPage = page - 2 > 2;
  const renderLastPage = page + 2 < pages;

  const renderPages = useMemo(() => {
    if (pages < 3) {
      return Array.from({ length: pages }, (_, i) => i + 1);
    }
    if (page === 1) {
      return [page, page + 1, page + 2];
    }

    if (page === pages) {
      return [page - 2, page - 1, page];
    }

    return [page - 1, page, page + 1];
  }, [page, pages]);

  return (
    <div>
      <div className="flex flex-row justify-center gap-2">
        {renderFirstPage && (
          <div className="flex flex-row items-center gap-2">
            <Button
              className="flex h-9 w-9 items-center justify-center whitespace-nowrap"
              variant="outline"
              onClick={() => navigateToPage(1)}
            >
              1
            </Button>
            ·
          </div>
        )}
        {renderPages.map((pageNumber) => (
          <Button
            className="flex h-9 w-9 items-center justify-center whitespace-nowrap"
            variant={page === pageNumber ? "default" : "outline"}
            key={pageNumber}
            onClick={() => navigateToPage(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}
        {renderLastPage && (
          <div className="flex flex-row items-center gap-2">
            ·
            <Button
              className="flex h-9 w-9 items-center justify-center whitespace-nowrap"
              variant="outline"
              onClick={() => navigateToPage(pages)}
            >
              {pages}
            </Button>
          </div>
        )}
      </div>
      <p className="mt-2 text-center text-sm text-gray-500">
        Showing {page} of {Math.max(1, pages)} pages ({total} items)
      </p>
    </div>
  );
};

export default CustomPagination;
