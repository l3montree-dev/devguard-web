import { Paged } from "@/types/api/api";
import React, { FunctionComponent, useMemo } from "react";
import Button from "./Button";
import { useRouter } from "next/router";

interface Props extends Paged<any> {}
const Pagination: FunctionComponent<Props> = ({ page, pageSize, total }) => {
  // calculate the amount of pages
  const pages = Math.ceil(total / pageSize);
  const router = useRouter();

  const navigateToPage = (page: number) => {
    router.push({
      query: { ...router.query, page },
    });
  };
  // check how many to the left and right of the current page
  const renderFirstPage = page > 2;
  const renderLastPage = page < pages - 1;

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
      <div className="flex gap-2 flex-row justify-center">
        {renderFirstPage && (
          <div className="flex flex-row items-center gap-2">
            <Button
              className="w-9 flex justify-center items-center h-9 whitespace-nowrap"
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
            className="w-9 flex justify-center items-center h-9 whitespace-nowrap"
            variant={page === pageNumber ? "solid" : "outline"}
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
              className="w-9 flex justify-center items-center h-9 whitespace-nowrap"
              variant="outline"
              onClick={() => navigateToPage(pages)}
            >
              {pages}
            </Button>
          </div>
        )}
      </div>
      <p className="text-sm mt-2 text-gray-500 text-center">
        Showing {page} of {Math.max(1, pages)} pages ({total} items)
      </p>
    </div>
  );
};

export default Pagination;
