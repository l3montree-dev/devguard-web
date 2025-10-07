import { classNames } from "../utils/common";
import { Skeleton } from "./ui/skeleton";

const PageSkeleton = () => {
  return (
    <main className="flex-1 font-body">
      <div
        className={classNames(
          "mx-auto h-screen max-w-screen-xl gap-4 px-6 pb-8 pt-6 lg:px-8",
        )}
      />

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
