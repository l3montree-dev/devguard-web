import React from "react";
import { classNames } from "../utils/common";
import { Skeleton } from "./ui/skeleton";
import { Loader2 } from "lucide-react";

const PageSkeleton = () => {
  return (
    <main className="flex-1 font-body">
      <header
        className={classNames(
          "relative z-20 flex min-h-[109px] items-center justify-between bg-header px-4 pt-5 sm:px-6 lg:px-8 pb-5",
        )}
      >
        <div className="mx-auto w-full max-w-screen-2xl">
          <div className="flex flex-row items-center gap-4">
            <Skeleton className="h-[28px] w-10" />
            <div className="flex w-full flex-row items-center justify-between">
              <h1 className="font-display whitespace-nowrap text-lg font-semibold leading-7 text-header-foreground">
                <Skeleton className="h-[28px] w-64" />
              </h1>
              <Skeleton className="w-64 h-[28px]" />
            </div>
          </div>

          <div className="flex mt-4 -mb-8 flex-row items-end gap-6 text-sm">
            {Array.from(Array(5).keys()).map((el) => (
              <Skeleton className="w-[100px] h-[20px]" key={el} />
            ))}
          </div>
        </div>
      </header>

      <div
        className={classNames(
          "mx-auto h-screen max-w-screen-xl gap-4 px-6 pb-8 pt-6 lg:px-8",
        )}
      >
        <div className="opacity-25 text-center">Loading...</div>
      </div>

      <div className="bg-footer">
        <footer className="mx-auto max-w-screen-xl px-6 py-8 text-sm text-footer-foreground lg:px-8">
          <div className="mb-2 flex flex-row gap-5">
            {Array.from(Array(5).keys()).map((el) => (
              <Skeleton key={el} />
            ))}
          </div>
          <Skeleton />
        </footer>
      </div>
    </main>
  );
};

export default PageSkeleton;
