import { Paged } from "@/types/api/api";
import React, { FunctionComponent, useMemo } from "react";

import { useRouter } from "next/router";
import { Button } from "../ui/button";

const getPaginationData = (currentPage: number, totalPages: number) => {
  const showFirstPage = currentPage > 3;
  const showLastPage = currentPage + 2 < totalPages;

  const getPages = (): number[] => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // If we're showing first page separately, don't include it in the main range
    if (showFirstPage && showLastPage) {
      return [currentPage - 1, currentPage, currentPage + 1];
    }

    // If we're showing first page separately but not last page
    if (showFirstPage && !showLastPage) {
      if (currentPage === totalPages) {
        return [currentPage - 2, currentPage - 1, currentPage];
      }
      return [currentPage - 1, currentPage, currentPage + 1];
    }

    // If we're not showing first page separately but showing last page
    if (!showFirstPage && showLastPage) {
      if (currentPage === 1) {
        return [currentPage, currentPage + 1, currentPage + 2];
      }
      return [currentPage - 1, currentPage, currentPage + 1];
    }

    // If we're not showing either first or last page separately
    if (currentPage === 1) {
      return [currentPage, currentPage + 1, currentPage + 2];
    }
    if (currentPage === totalPages) {
      return [currentPage - 2, currentPage - 1, currentPage];
    }

    return [currentPage - 1, currentPage, currentPage + 1];
  };

  return {
    pages: getPages(),
    showFirstPage,
    showLastPage,
  };
};

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

  const paginationData = useMemo(() => {
    return getPaginationData(page, pages);
  }, [page, pages]);

  const {
    pages: renderPages,
    showFirstPage: renderFirstPage,
    showLastPage: renderLastPage,
  } = paginationData;

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
            variant={page === pageNumber ? "secondary" : "outline"}
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
